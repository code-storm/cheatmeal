import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { getOrCreateDailyPlan, getPlanForDate, type DailyPlanDTO } from "../services/planGenerator.service";
import { isTaskStatus } from "../lib/enums";

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
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      type: task.type,
      mealSlot: task.mealSlot,
      name: task.name,
      description: task.description,
      scheduledTime: task.scheduledTime,
      status: task.status,
    })),
  };
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

    const updated = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

// This route must be registered after the more specific /plan/* routes above
// (today, history, task/:taskId) so it doesn't shadow them.
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
