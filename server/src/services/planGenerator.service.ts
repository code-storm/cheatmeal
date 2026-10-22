import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { computeCurrentWeek, trimesterForWeek } from "./pregnancyWeek.service";
import type { ItemType, MealSlot, TaskStatus } from "../lib/enums";
import { allowedDietTypesFor, type DietType, type DietPreference } from "../lib/enums";
import { DAILY_MACRO_TARGETS, type MacroTarget } from "../content/macroTargets";
import { POINTS_BY_TASK_TYPE, CUSTOM_TASK_POINTS } from "../content/points";

// ---------------------------------------------------------------------------
// Public DTO shapes
// ---------------------------------------------------------------------------

export interface DailyPlanTaskDTO {
  id: string;
  taskTemplateId: string | null;
  type: ItemType;
  mealSlot: MealSlot | null;
  name: string;
  description: string;
  scheduledTime: string;
  status: TaskStatus;
  completedAt: Date | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  pointsAwarded: number;
  isCustom: boolean;
}

export interface DailyPlanDTO {
  id: string;
  userId: string;
  date: string;
  pregnancyWeekAtGeneration: number;
  generatedAt: Date;
  tasks: DailyPlanTaskDTO[];
  macroTarget: MacroTarget;
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

export function isExcludedByAvoidRules(
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
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function isAllowedByDiet(dietType: string, allowed: DietType[]): boolean {
  return (allowed as readonly string[]).includes(dietType);
}

async function pickMealForPool(
  userId: string,
  rotationPoolKey: string,
  dateStr: string,
  candidates: MealCandidate[],
  ignoreRecency = false
): Promise<MealCandidate> {
  if (candidates.length === 1) {
    return candidates[0];
  }

  if (ignoreRecency) {
    // Fresh Pick power: skip the 7-day no-repeat check entirely and pick
    // uniformly at random from every candidate passed in. The caller
    // (pickAlternativeForSlot) has already excluded the currently-assigned
    // template and applied diet/avoid-rule filters - this only removes the
    // recency exclusion, nothing else.
    return candidates[Math.floor(Math.random() * candidates.length)];
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

export async function pickAlternativeForSlot(
  userId: string,
  dateStr: string,
  currentWeek: number,
  mealSlot: MealSlot,
  rotationPoolKey: string,
  excludeTemplateId: string,
  allowedDietTypes: DietType[],
  ignoreRecency = false
): Promise<MealCandidate | null> {
  const foodAvoidRules = await prisma.foodAvoidRule.findMany({
    where: { severity: "avoid", minWeek: { lte: currentWeek }, maxWeek: { gte: currentWeek } },
  });

  const slotTemplates = await prisma.taskTemplate.findMany({
    where: {
      isActive: true,
      type: "MEAL",
      mealSlot,
      rotationPoolKey,
      minWeek: { lte: currentWeek },
      maxWeek: { gte: currentWeek },
      id: { not: excludeTemplateId },
    },
  });

  const candidates: MealCandidate[] = slotTemplates
    .filter((t) => isAllowedByDiet(t.dietType, allowedDietTypes))
    .filter((t) => !isExcludedByAvoidRules(t.name, t.description, foodAvoidRules, currentWeek).excluded)
    .map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      defaultTime: t.defaultTime,
      rotationPoolKey: t.rotationPoolKey as string,
      calories: t.calories,
      proteinG: t.proteinG,
      carbsG: t.carbsG,
      fatG: t.fatG,
    }));

  if (candidates.length === 0) return null;
  return pickMealForPool(userId, rotationPoolKey, dateStr, candidates, ignoreRecency);
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
      customTaskInstances: {
        include: { customTask: true },
      },
    },
  });
  if (!plan) return null;
  return toDTO(plan);
}

type PlanWithTasksAndTemplates = Prisma.DailyPlanGetPayload<{
  include: {
    tasks: { include: { taskTemplate: true } };
    customTaskInstances: { include: { customTask: true } };
  };
}>;

function toDTO(plan: PlanWithTasksAndTemplates): DailyPlanDTO {
  const systemTasks: DailyPlanTaskDTO[] = plan.tasks.map((task) => ({
    id: task.id,
    taskTemplateId: task.taskTemplateId,
    type: task.taskTemplate.type as ItemType,
    mealSlot: (task.taskTemplate.mealSlot as MealSlot | null) ?? null,
    name: task.taskTemplate.name,
    description: task.taskTemplate.description,
    scheduledTime: task.scheduledTime,
    status: task.status as TaskStatus,
    completedAt: task.completedAt,
    calories: task.calories,
    proteinG: task.proteinG,
    carbsG: task.carbsG,
    fatG: task.fatG,
    pointsAwarded: task.pointsAwarded,
    isCustom: false,
  }));

  const customTasks: DailyPlanTaskDTO[] = plan.customTaskInstances.map((instance) => ({
    id: instance.id,
    taskTemplateId: null,
    type: instance.customTask.type as ItemType,
    mealSlot: null,
    name: instance.customTask.name,
    description: "",
    scheduledTime: instance.scheduledTime,
    status: instance.status as TaskStatus,
    completedAt: instance.completedAt,
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    pointsAwarded: instance.pointsAwarded,
    isCustom: true,
  }));

  const tasks = [...systemTasks, ...customTasks].sort((a, b) =>
    a.scheduledTime.localeCompare(b.scheduledTime)
  );

  return {
    id: plan.id,
    userId: plan.userId,
    date: plan.date,
    pregnancyWeekAtGeneration: plan.pregnancyWeekAtGeneration,
    generatedAt: plan.generatedAt,
    tasks,
    macroTarget: DAILY_MACRO_TARGETS[trimesterForWeek(plan.pregnancyWeekAtGeneration)],
  };
}

// ---------------------------------------------------------------------------
// Custom tasks: sync a user's active CustomTask rows into CustomTaskInstance
// rows for a specific (already-existing) DailyPlan. Safe to call repeatedly -
// upserts keyed on @@unique([customTaskId, dailyPlanId]), so it's a no-op for
// instances that already exist. Only ever called from getOrCreateDailyPlan,
// never from the read-only getPlanForDate - a DAILY custom task therefore
// only starts appearing from the next time "today" is actually visited on or
// after its startDate, deliberately mirroring how system content is also
// never backfilled for a day the user skipped opening the app on.
// ---------------------------------------------------------------------------

async function syncCustomTaskInstances(userId: string, dateStr: string, dailyPlanId: string): Promise<void> {
  const customTasks = await prisma.customTask.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { recurrence: "DAILY", startDate: { lte: dateStr } },
        { recurrence: "ONE_TIME", startDate: dateStr },
      ],
    },
  });

  for (const customTask of customTasks) {
    await prisma.customTaskInstance.upsert({
      where: { customTaskId_dailyPlanId: { customTaskId: customTask.id, dailyPlanId } },
      update: {},
      create: {
        customTaskId: customTask.id,
        dailyPlanId,
        scheduledTime: customTask.scheduledTime,
        status: "PENDING",
        pointsAwarded: CUSTOM_TASK_POINTS,
      },
    });
  }
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
  const existingPlan = await prisma.dailyPlan.findUnique({
    where: { userId_date: { userId, date: dateStr } },
    select: { id: true },
  });
  if (existingPlan) {
    await syncCustomTaskInstances(userId, dateStr, existingPlan.id);
    const existing = await fetchPlanWithTasks(userId, dateStr);
    if (existing) return existing;
  }

  const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new Error("PROFILE_REQUIRED");
  }
  const allowedDietTypes = allowedDietTypesFor((profile.dietPreference as DietPreference) ?? "NO_RESTRICTION");

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
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
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

    const dietFilteredTemplates = slotTemplates.filter((t) => isAllowedByDiet(t.dietType, allowedDietTypes));

    const safeSlotTemplates = dietFilteredTemplates.filter((template) => {
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
        calories: template.calories,
        proteinG: template.proteinG,
        carbsG: template.carbsG,
        fatG: template.fatG,
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
        calories: picked.calories,
        proteinG: picked.proteinG,
        carbsG: picked.carbsG,
        fatG: picked.fatG,
      });
    }
  }

  // --- Build creation inputs ----------------------------------------------
  const dailyTaskInputs = [
    ...includedNonMealTemplates.map((template) => ({
      taskTemplateId: template.id,
      scheduledTime: template.defaultTime,
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      pointsAwarded: POINTS_BY_TASK_TYPE[template.type as ItemType],
    })),
    ...mealPicksForTasks.map((pick) => ({
      taskTemplateId: pick.templateId,
      scheduledTime: pick.defaultTime,
      calories: pick.calories,
      proteinG: pick.proteinG,
      carbsG: pick.carbsG,
      fatG: pick.fatG,
      pointsAwarded: POINTS_BY_TASK_TYPE.MEAL,
    })),
  ];

  let createdPlanId: string | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.dailyPlan.create({
        data: {
          userId,
          date: dateStr,
          pregnancyWeekAtGeneration: currentWeek,
        },
      });
      createdPlanId = plan.id;

      if (dailyTaskInputs.length > 0) {
        await tx.dailyTask.createMany({
          data: dailyTaskInputs.map((input) => ({
            dailyPlanId: plan.id,
            taskTemplateId: input.taskTemplateId,
            scheduledTime: input.scheduledTime,
            status: "PENDING",
            calories: input.calories,
            proteinG: input.proteinG,
            carbsG: input.carbsG,
            fatG: input.fatG,
            pointsAwarded: input.pointsAwarded,
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
      const nowExisting = await prisma.dailyPlan.findUnique({
        where: { userId_date: { userId, date: dateStr } },
        select: { id: true },
      });
      if (nowExisting) {
        await syncCustomTaskInstances(userId, dateStr, nowExisting.id);
        const existing = await fetchPlanWithTasks(userId, dateStr);
        if (existing) return existing;
      }
    }
    throw err;
  }

  if (createdPlanId) {
    await syncCustomTaskInstances(userId, dateStr, createdPlanId);
  }

  const created = await fetchPlanWithTasks(userId, dateStr);
  if (!created) {
    throw new Error("Failed to load newly created daily plan");
  }
  return created;
}
