// SQLite (via Prisma) has no native enum support, so the enums specified in
// the product's Prisma schema (ItemType, MealSlot, TaskStatus) are stored as
// plain String columns in prisma/schema.prisma. These TypeScript union types
// + runtime guards are the application-layer enforcement of those value sets.

export const ITEM_TYPES = ["MEAL", "EXERCISE", "HABIT", "GROOMING"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const MEAL_SLOTS = [
  "EARLY_MORNING",
  "BREAKFAST",
  "MID_MORNING_SNACK",
  "LUNCH",
  "EVENING_SNACK",
  "DINNER",
  "BEDTIME",
] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const TASK_STATUSES = ["PENDING", "COMPLETED", "SKIPPED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isItemType(value: unknown): value is ItemType {
  return typeof value === "string" && (ITEM_TYPES as readonly string[]).includes(value);
}

export function isMealSlot(value: unknown): value is MealSlot {
  return typeof value === "string" && (MEAL_SLOTS as readonly string[]).includes(value);
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value);
}
