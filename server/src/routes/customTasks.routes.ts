import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { isItemType, isTaskStatus, isCustomTaskRecurrence } from "../lib/enums";
import { awardPoints, revertPoints } from "../services/points.service";
import { recordStreakActivity } from "../services/streak.service";
import { checkAndAwardBadges } from "../services/badges.service";
import { CUSTOM_TASK_POINTS } from "../content/points";

const router = Router();

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function todayDateStrLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

router.post("/custom-tasks", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { name, type, scheduledTime, recurrence, startDate } = req.body as {
      name?: unknown;
      type?: unknown;
      scheduledTime?: unknown;
      recurrence?: unknown;
      startDate?: unknown;
    };

    if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
      res.status(400).json({ error: "name must be between 1 and 100 characters." });
      return;
    }
    if (!isItemType(type)) {
      res.status(400).json({ error: "type must be one of MEAL, EXERCISE, HABIT, GROOMING." });
      return;
    }
    if (typeof scheduledTime !== "string" || !TIME_REGEX.test(scheduledTime)) {
      res.status(400).json({ error: "scheduledTime must be in HH:mm format." });
      return;
    }
    if (!isCustomTaskRecurrence(recurrence)) {
      res.status(400).json({ error: "recurrence must be one of ONE_TIME, DAILY." });
      return;
    }

    const todayStr = todayDateStrLocal();
    let resolvedStartDate = todayStr;
    if (startDate !== undefined) {
      if (typeof startDate !== "string" || !DATE_REGEX.test(startDate)) {
        res.status(400).json({ error: "startDate must be in YYYY-MM-DD format." });
        return;
      }
      resolvedStartDate = startDate;
    }

    const customTask = await prisma.customTask.create({
      data: {
        userId,
        name: name.trim(),
        type,
        scheduledTime,
        recurrence,
        startDate: resolvedStartDate,
      },
    });

    // If this task is already eligible for today and today's plan exists,
    // sync it in immediately so it shows up without waiting for tomorrow.
    if (resolvedStartDate <= todayStr) {
      const todaysPlan = await prisma.dailyPlan.findUnique({
        where: { userId_date: { userId, date: todayStr } },
        select: { id: true },
      });
      if (todaysPlan) {
        const eligible =
          (recurrence === "DAILY" && resolvedStartDate <= todayStr) ||
          (recurrence === "ONE_TIME" && resolvedStartDate === todayStr);
        if (eligible) {
          await prisma.customTaskInstance.upsert({
            where: { customTaskId_dailyPlanId: { customTaskId: customTask.id, dailyPlanId: todaysPlan.id } },
            update: {},
            create: {
              customTaskId: customTask.id,
              dailyPlanId: todaysPlan.id,
              scheduledTime: customTask.scheduledTime,
              status: "PENDING",
              pointsAwarded: CUSTOM_TASK_POINTS,
            },
          });
        }
      }
    }

    const newBadges = await prisma.$transaction((tx) => checkAndAwardBadges(tx, userId));

    res.status(201).json({ customTask, newBadges });
  } catch (err) {
    next(err);
  }
});

router.get("/custom-tasks", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const customTasks = await prisma.customTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ customTasks });
  } catch (err) {
    next(err);
  }
});

router.patch("/custom-tasks/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params;
    const { isActive } = req.body as { isActive?: unknown };

    if (isActive !== undefined && typeof isActive !== "boolean") {
      res.status(400).json({ error: "isActive must be a boolean." });
      return;
    }

    const existing = await prisma.customTask.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Custom task not found." });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const customTask = await prisma.customTask.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    res.json({ customTask });
  } catch (err) {
    next(err);
  }
});

router.patch("/custom-tasks/instance/:instanceId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { instanceId } = req.params;
    const { status } = req.body as { status?: unknown };

    if (!isTaskStatus(status)) {
      res.status(400).json({ error: "status must be one of PENDING, COMPLETED, SKIPPED." });
      return;
    }

    const instance = await prisma.customTaskInstance.findUnique({
      where: { id: instanceId },
      include: { dailyPlan: true },
    });

    if (!instance) {
      res.status(404).json({ error: "Task not found." });
      return;
    }
    if (instance.dailyPlan.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const previousStatus = instance.status;

    const result = await prisma.$transaction(async (tx) => {
      const updatedInstance = await tx.customTaskInstance.update({
        where: { id: instanceId },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      let pointsDelta = 0;
      let newBadges: Awaited<ReturnType<typeof checkAndAwardBadges>> = [];
      let graceTokenConsumed = false;
      if (previousStatus !== "COMPLETED" && status === "COMPLETED") {
        await awardPoints(tx, userId, instance.pointsAwarded);
        pointsDelta = instance.pointsAwarded;
        ({ graceTokenConsumed } = await recordStreakActivity(tx, userId, instance.dailyPlan.date));
        newBadges = await checkAndAwardBadges(tx, userId);
      } else if (previousStatus === "COMPLETED" && status !== "COMPLETED") {
        await revertPoints(tx, userId, instance.pointsAwarded);
        pointsDelta = -instance.pointsAwarded;
      }

      const profile = await tx.pregnancyProfile.findUnique({ where: { userId } });
      return {
        task: updatedInstance,
        pointsDelta,
        pointsBalance: profile?.pointsBalance ?? 0,
        newBadges,
        graceTokenConsumed,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
