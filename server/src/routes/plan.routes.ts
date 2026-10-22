import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import {
  getOrCreateDailyPlan,
  getPlanForDate,
  pickAlternativeForSlot,
  type DailyPlanDTO,
} from "../services/planGenerator.service";
import { computeCurrentWeek } from "../services/pregnancyWeek.service";
import { awardPoints, revertPoints } from "../services/points.service";
import { recordStreakActivity } from "../services/streak.service";
import { checkAndAwardBadges } from "../services/badges.service";
import { isTaskStatus, allowedDietTypesFor, type DietPreference, type MealSlot } from "../lib/enums";

const router = Router();

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function todayDateStrLocal(): string {
  // Server's local date, "fine for MVP, single-timezone-market" per spec.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function serializePlanResponse(plan: DailyPlanDTO) {
  return {
    date: plan.date,
    pregnancyWeek: plan.pregnancyWeekAtGeneration,
    macroTarget: plan.macroTarget,
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      type: task.type,
      mealSlot: task.mealSlot,
      name: task.name,
      description: task.description,
      scheduledTime: task.scheduledTime,
      status: task.status,
      calories: task.calories,
      proteinG: task.proteinG,
      carbsG: task.carbsG,
      fatG: task.fatG,
      pointsAwarded: task.pointsAwarded,
      isCustom: task.isCustom,
    })),
  };
}

function tomorrowDateStrLocal(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

router.get("/plan/today", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const dateStr = todayDateStrLocal();

    const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(400).json({ error: "Profile required" });
      return;
    }

    const plan = await getOrCreateDailyPlan(userId, dateStr);
    res.json(serializePlanResponse(plan));
  } catch (err) {
    if (err instanceof Error && err.message === "PROFILE_REQUIRED") {
      res.status(400).json({ error: "Profile required" });
      return;
    }
    next(err);
  }
});

router.get("/plan/history", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { from, to } = req.query as { from?: string; to?: string };

    let fromDate: string;
    let toDate: string;

    if (from && DATE_REGEX.test(from) && to && DATE_REGEX.test(to)) {
      fromDate = from;
      toDate = to;
    } else {
      const todayStr = todayDateStrLocal();
      const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
      const fromDateObj = new Date(todayDate);
      fromDateObj.setUTCDate(fromDateObj.getUTCDate() - 30);
      fromDate = fromDateObj.toISOString().slice(0, 10);
      toDate = todayStr;
    }

    const plans = await prisma.dailyPlan.findMany({
      where: {
        userId,
        date: { gte: fromDate, lte: toDate },
      },
      include: {
        tasks: { select: { status: true } },
      },
      orderBy: { date: "asc" },
    });

    const days = plans.map((plan) => {
      const completedCount = plan.tasks.filter((t) => t.status === "COMPLETED").length;
      const skippedCount = plan.tasks.filter((t) => t.status === "SKIPPED").length;
      return {
        date: plan.date,
        completedCount,
        totalCount: plan.tasks.length,
        skippedCount,
      };
    });

    res.json({ days });
  } catch (err) {
    next(err);
  }
});

router.patch("/plan/task/:taskId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { taskId } = req.params;
    const { status } = req.body as { status?: unknown };

    if (!isTaskStatus(status)) {
      res.status(400).json({ error: "status must be one of PENDING, COMPLETED, SKIPPED." });
      return;
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: { dailyPlan: true },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    if (task.dailyPlan.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const previousStatus = task.status;

    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.dailyTask.update({
        where: { id: taskId },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      let pointsDelta = 0;
      let newBadges: Awaited<ReturnType<typeof checkAndAwardBadges>> = [];
      let graceTokenConsumed = false;
      if (previousStatus !== "COMPLETED" && status === "COMPLETED") {
        await awardPoints(tx, userId, task.pointsAwarded);
        pointsDelta = task.pointsAwarded;
        ({ graceTokenConsumed } = await recordStreakActivity(tx, userId, task.dailyPlan.date));
        newBadges = await checkAndAwardBadges(tx, userId);
      } else if (previousStatus === "COMPLETED" && status !== "COMPLETED") {
        await revertPoints(tx, userId, task.pointsAwarded);
        pointsDelta = -task.pointsAwarded;
      }

      const profile = await tx.pregnancyProfile.findUnique({ where: { userId } });
      return {
        task: updatedTask,
        pointsDelta,
        pointsBalance: profile?.pointsBalance ?? 0,
        newBadges,
        graceTokenConsumed,
      };
    }, { timeout: 15000 });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/plan/task/:taskId/swap", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { taskId } = req.params;
    const { ignoreRecency } = req.body as { ignoreRecency?: unknown };

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: { dailyPlan: true, taskTemplate: true },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found." });
      return;
    }
    if (task.dailyPlan.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (task.taskTemplate.type !== "MEAL") {
      res.status(400).json({ error: "Only meal tasks can be swapped." });
      return;
    }
    const todayStr = todayDateStrLocal();
    if (task.dailyPlan.date !== todayStr) {
      res.status(400).json({ error: "Only today's plan can be swapped." });
      return;
    }
    if (!task.taskTemplate.rotationPoolKey || !task.taskTemplate.mealSlot) {
      res.status(400).json({ error: "This meal has no alternatives configured." });
      return;
    }

    const useFreshPick = ignoreRecency === true;
    if (useFreshPick) {
      const freshPickUnlocked = await prisma.userReward.findFirst({
        where: { userId, rewardItem: { powerKey: "FRESH_PICK" } },
      });
      if (!freshPickUnlocked) {
        res.status(403).json({ error: "Unlock Fresh Pick to use this." });
        return;
      }
    }

    const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(400).json({ error: "Profile required" });
      return;
    }

    const currentWeek = computeCurrentWeek(profile.lmpDate, new Date());
    const allowedDietTypes = allowedDietTypesFor((profile.dietPreference as DietPreference) ?? "NO_RESTRICTION");

    const alternative = await pickAlternativeForSlot(
      userId,
      todayStr,
      currentWeek,
      task.taskTemplate.mealSlot as MealSlot,
      task.taskTemplate.rotationPoolKey,
      task.taskTemplateId,
      allowedDietTypes,
      useFreshPick
    );

    if (!alternative) {
      res.status(409).json({ error: "No alternative available right now." });
      return;
    }

    const wasCompleted = task.status === "COMPLETED";

    const updated = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.dailyTask.update({
        where: { id: taskId },
        data: {
          taskTemplateId: alternative.id,
          scheduledTime: alternative.defaultTime,
          status: "PENDING",
          completedAt: null,
          calories: alternative.calories,
          proteinG: alternative.proteinG,
          carbsG: alternative.carbsG,
          fatG: alternative.fatG,
        },
      });

      // The user never completed the new pick, so if the old meal had
      // already been marked done, its points must be given back.
      if (wasCompleted) {
        await revertPoints(tx, userId, task.pointsAwarded);
      }

      await tx.mealServingLog.deleteMany({
        where: { userId, taskTemplateId: task.taskTemplateId, servedDate: todayStr },
      });
      await tx.mealServingLog.create({
        data: {
          userId,
          taskTemplateId: alternative.id,
          rotationPoolKey: alternative.rotationPoolKey,
          servedDate: todayStr,
        },
      });

      return updatedTask;
    }, { timeout: 15000 });

    res.json({
      task: {
        id: updated.id,
        name: alternative.name,
        description: alternative.description,
        scheduledTime: updated.scheduledTime,
        status: updated.status,
        calories: updated.calories,
        proteinG: updated.proteinG,
        carbsG: updated.carbsG,
        fatG: updated.fatG,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/plan/tomorrow-preview", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;

    const previewUnlocked = await prisma.userReward.findFirst({
      where: { userId, rewardItem: { powerKey: "TOMORROW_PREVIEW" } },
    });
    if (!previewUnlocked) {
      res.status(403).json({ error: "Unlock Tomorrow's Preview to use this." });
      return;
    }

    const tomorrowStr = tomorrowDateStrLocal();
    const plan = await getOrCreateDailyPlan(userId, tomorrowStr);
    res.json({ ...serializePlanResponse(plan), preview: true });
  } catch (err) {
    if (err instanceof Error && err.message === "PROFILE_REQUIRED") {
      res.status(400).json({ error: "Profile required" });
      return;
    }
    next(err);
  }
});

// This route must be registered after the more specific /plan/* routes above
// (today, history, task/:taskId, tomorrow-preview) so it doesn't shadow them.
router.get("/plan/:date", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { date } = req.params;

    if (!DATE_REGEX.test(date)) {
      res.status(400).json({ error: "date must be in YYYY-MM-DD format." });
      return;
    }

    const plan = await getPlanForDate(userId, date);
    if (!plan) {
      res.status(404).json({ error: "No plan for this date" });
      return;
    }

    res.json(serializePlanResponse(plan));
  } catch (err) {
    next(err);
  }
});

export default router;
