import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { computeCurrentWeek } from "./pregnancyWeek.service";
import type { ItemType, MealSlot, TaskStatus } from "../lib/enums";

// ---------------------------------------------------------------------------
// Public DTO shapes
// ---------------------------------------------------------------------------

export interface DailyPlanTaskDTO {
  id: string;
  taskTemplateId: string;
  type: ItemType;
  mealSlot: MealSlot | null;
  name: string;
  description: string;
  scheduledTime: string;
  status: TaskStatus;
  completedAt: Date | null;
}

export interface DailyPlanDTO {
  id: string;
  userId: string;
  date: string;
  pregnancyWeekAtGeneration: number;
  generatedAt: Date;
  tasks: DailyPlanTaskDTO[];
}

// ---------------------------------------------------------------------------
// Date helpers (UTC-anchored so date-only arithmetic is deterministic
// regardless of server timezone / DST).
// ---------------------------------------------------------------------------

function parseDateOnlyUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function formatDateOnlyUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateNDaysBefore(dateStr: string, n: number): string {
  const d = parseDateOnlyUTC(dateStr);
  d.setUTCDate(d.getUTCDate() - n);
  return formatDateOnlyUTC(d);
}

// ---------------------------------------------------------------------------
// Avoid-rule substring matching
// ---------------------------------------------------------------------------

interface MatchableRule {
  matchTags: string;
  severity: string;
  minWeek: number;
  maxWeek: number;
}

function isExcludedByAvoidRules(
  name: string,
  description: string,
  rules: MatchableRule[],
  currentWeek: number
): { excluded: boolean; matchedTag?: string } {
  const text = `${name} ${description}`.toLowerCase();
  for (const rule of rules) {
    if (rule.severity !== "avoid") continue;
    if (currentWeek < rule.minWeek || currentWeek > rule.maxWeek) continue;
    const tags = rule.matchTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    for (const tag of tags) {
      if (text.includes(tag)) {
        return { excluded: true, matchedTag: tag };
      }
    }
  }
  return { excluded: false };
}

// ---------------------------------------------------------------------------
// Rotation / meal-pick logic
// ---------------------------------------------------------------------------

interface MealCandidate {
  id: string;
  name: string;
  description: string;
  defaultTime: string;
  rotationPoolKey: string;
}

async function pickMealForPool(
  userId: string,
  rotationPoolKey: string,
  dateStr: string,
  candidates: MealCandidate[]
): Promise<MealCandidate> {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const sevenDaysAgo = dateNDaysBefore(dateStr, 7);
  const recentLogs = await prisma.mealServingLog.findMany({
    where: {
      userId,
      rotationPoolKey,
      servedDate: { gte: sevenDaysAgo, lt: dateStr },
    },
    select: { taskTemplateId: true },
  });
  const recentlyServedIds = new Set(recentLogs.map((l) => l.taskTemplateId));

  const remaining = candidates.filter((c) => !recentlyServedIds.has(c.id));
  if (remaining.length > 0) {
    return remaining[Math.floor(Math.random() * remaining.length)];
  }

  // Fallback: pick the least-recently-served candidate(s) in the full pool,
  // breaking ties randomly. "Never served" sorts before any served date.
  const lastServedByCandidate = new Map<string, string>(); // '' sentinel = never served
  for (const candidate of candidates) {
    const lastLog = await prisma.mealServingLog.findFirst({
      where: { userId, rotationPoolKey, taskTemplateId: candidate.id },
      orderBy: { servedDate: "desc" },
      select: { servedDate: true },
    });
    lastServedByCandidate.set(candidate.id, lastLog?.servedDate ?? "");
  }

  let oldestKey = lastServedByCandidate.get(candidates[0].id) ?? "";
  for (const candidate of candidates) {
    const key = lastServedByCandidate.get(candidate.id) ?? "";
    if (key < oldestKey) oldestKey = key;
  }

  const tied = candidates.filter((c) => (lastServedByCandidate.get(c.id) ?? "") === oldestKey);
  return tied[Math.floor(Math.random() * tied.length)];
}

// ---------------------------------------------------------------------------
// Internal: fetch an existing plan (with tasks + templates joined), or null.
// ---------------------------------------------------------------------------

async function fetchPlanWithTasks(userId: string, dateStr: string): Promise<DailyPlanDTO | null> {
  const plan = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date: dateStr } },
    include: {
      tasks: {
        include: { taskTemplate: true },
      },
    },
  });
  if (!plan) return null;
  return toDTO(plan);
}

type PlanWithTasksAndTemplates = Prisma.DailyPlanGetPayload<{
  include: { tasks: { include: { taskTemplate: true } } };
}>;

function toDTO(plan: PlanWithTasksAndTemplates): DailyPlanDTO {
  const tasks: DailyPlanTaskDTO[] = plan.tasks
    .map((task) => ({
      id: task.id,
      taskTemplateId: task.taskTemplateId,
      type: task.taskTemplate.type as ItemType,
      mealSlot: (task.taskTemplate.mealSlot as MealSlot | null) ?? null,
      name: task.taskTemplate.name,
      description: task.taskTemplate.description,
      scheduledTime: task.scheduledTime,
      status: task.status as TaskStatus,
      completedAt: task.completedAt,
    }))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return {
    id: plan.id,
    userId: plan.userId,
    date: plan.date,
    pregnancyWeekAtGeneration: plan.pregnancyWeekAtGeneration,
    generatedAt: plan.generatedAt,
    tasks,
  };
}

const ALL_MEAL_SLOTS: MealSlot[] = [
  "EARLY_MORNING",
  "BREAKFAST",
  "MID_MORNING_SNACK",
  "LUNCH",
  "EVENING_SNACK",
  "DINNER",
  "BEDTIME",
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read-only lookup. Returns null if no plan exists for this date - never
 * triggers generation. Used for past/future-date lookups (history, specific
 * date endpoint).
 */
export async function getPlanForDate(userId: string, dateStr: string): Promise<DailyPlanDTO | null> {
  return fetchPlanWithTasks(userId, dateStr);
}

/**
 * Returns the existing DailyPlan for (userId, dateStr) if one exists
 * (never regenerates an existing day), otherwise deterministically generates
 * one from the content library + current pregnancy week + rotation history.
 */
export async function getOrCreateDailyPlan(userId: string, dateStr: string): Promise<DailyPlanDTO> {
  const existing = await fetchPlanWithTasks(userId, dateStr);
  if (existing) {
    return existing;
  }

  const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new Error("PROFILE_REQUIRED");
  }

  const onDate = parseDateOnlyUTC(dateStr);
  const currentWeek = computeCurrentWeek(profile.lmpDate, onDate);

  // --- Non-meal tasks (EXERCISE / HABIT / GROOMING) -----------------------
  const nonMealTemplates = await prisma.taskTemplate.findMany({
    where: {
      isActive: true,
      type: { not: "MEAL" },
      minWeek: { lte: currentWeek },
      maxWeek: { gte: currentWeek },
    },
  });

  const activityAvoidRules = await prisma.activityAvoidRule.findMany({
    where: { severity: "avoid", minWeek: { lte: currentWeek }, maxWeek: { gte: currentWeek } },
  });

  const includedNonMealTemplates = nonMealTemplates.filter((template) => {
    const result = isExcludedByAvoidRules(template.name, template.description, activityAvoidRules, currentWeek);
    if (result.excluded) {
      console.warn(
        `[planGenerator] Excluding activity template "${template.slug}" - matched avoid rule tag "${result.matchedTag}"`
      );
      return false;
    }
    return true;
  });

  // --- Meal tasks (rotation pools per slot) -------------------------------
  const foodAvoidRules = await prisma.foodAvoidRule.findMany({
    where: { severity: "avoid", minWeek: { lte: currentWeek }, maxWeek: { gte: currentWeek } },
  });

  const mealPicksForTasks: {
    templateId: string;
    name: string;
    description: string;
    defaultTime: string;
    rotationPoolKey: string;
    mealSlot: MealSlot;
  }[] = [];

  for (const slot of ALL_MEAL_SLOTS) {
    const slotTemplates = await prisma.taskTemplate.findMany({
      where: {
        isActive: true,
        type: "MEAL",
        mealSlot: slot,
        minWeek: { lte: currentWeek },
        maxWeek: { gte: currentWeek },
      },
    });

    const safeSlotTemplates = slotTemplates.filter((template) => {
      const result = isExcludedByAvoidRules(template.name, template.description, foodAvoidRules, currentWeek);
      if (result.excluded) {
        console.warn(
          `[planGenerator] Excluding meal template "${template.slug}" - matched food avoid rule tag "${result.matchedTag}"`
        );
        return false;
      }
      return true;
    });

    // Group by rotationPoolKey (written generically in case multiple pools
    // exist per slot in the future; today's content has exactly one).
    const pools = new Map<string, MealCandidate[]>();
    for (const template of safeSlotTemplates) {
      if (!template.rotationPoolKey) continue;
      const list = pools.get(template.rotationPoolKey) ?? [];
      list.push({
        id: template.id,
        name: template.name,
        description: template.description,
        defaultTime: template.defaultTime,
        rotationPoolKey: template.rotationPoolKey,
      });
      pools.set(template.rotationPoolKey, list);
    }

    for (const [rotationPoolKey, candidates] of pools) {
      if (candidates.length === 0) continue;
      const picked = await pickMealForPool(userId, rotationPoolKey, dateStr, candidates);
      mealPicksForTasks.push({
        templateId: picked.id,
        name: picked.name,
        description: picked.description,
        defaultTime: picked.defaultTime,
        rotationPoolKey,
        mealSlot: slot,
      });
    }
  }

  // --- Build creation inputs ----------------------------------------------
  const dailyTaskInputs = [
    ...includedNonMealTemplates.map((template) => ({
      taskTemplateId: template.id,
      scheduledTime: template.defaultTime,
    })),
    ...mealPicksForTasks.map((pick) => ({
      taskTemplateId: pick.templateId,
      scheduledTime: pick.defaultTime,
    })),
  ];

  try {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.dailyPlan.create({
        data: {
          userId,
          date: dateStr,
          pregnancyWeekAtGeneration: currentWeek,
        },
      });

      if (dailyTaskInputs.length > 0) {
        await tx.dailyTask.createMany({
          data: dailyTaskInputs.map((input) => ({
            dailyPlanId: plan.id,
            taskTemplateId: input.taskTemplateId,
            scheduledTime: input.scheduledTime,
            status: "PENDING",
          })),
        });
      }

      if (mealPicksForTasks.length > 0) {
        await tx.mealServingLog.createMany({
          data: mealPicksForTasks.map((pick) => ({
            userId,
            taskTemplateId: pick.templateId,
            rotationPoolKey: pick.rotationPoolKey,
            servedDate: dateStr,
          })),
        });
      }

      return plan;
    });
  } catch (err) {
    // A concurrent request may have created the plan first; the
    // @@unique([userId, date]) constraint raises Prisma error P2002.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const nowExisting = await fetchPlanWithTasks(userId, dateStr);
      if (nowExisting) {
        return nowExisting;
      }
    }
    throw err;
  }

  const created = await fetchPlanWithTasks(userId, dateStr);
  if (!created) {
    throw new Error("Failed to load newly created daily plan");
  }
  return created;
}
