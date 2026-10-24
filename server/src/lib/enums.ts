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

export const DIET_PREFERENCES = ["VEGETARIAN", "EGGETARIAN", "NON_VEGETARIAN", "NO_RESTRICTION"] as const;
export type DietPreference = (typeof DIET_PREFERENCES)[number];
export function isDietPreference(value: unknown): value is DietPreference {
  return typeof value === "string" && (DIET_PREFERENCES as readonly string[]).includes(value);
}

export const DIET_TYPES = ["VEGETARIAN", "EGGETARIAN", "NON_VEGETARIAN"] as const;
export type DietType = (typeof DIET_TYPES)[number];
export function isDietType(value: unknown): value is DietType {
  return typeof value === "string" && (DIET_TYPES as readonly string[]).includes(value);
}

export function allowedDietTypesFor(preference: DietPreference): DietType[] {
  switch (preference) {
    case "VEGETARIAN":
      return ["VEGETARIAN"];
    case "EGGETARIAN":
      return ["VEGETARIAN", "EGGETARIAN"];
    case "NON_VEGETARIAN":
    case "NO_RESTRICTION":
      return ["VEGETARIAN", "EGGETARIAN", "NON_VEGETARIAN"];
  }
}

export const CUSTOM_TASK_RECURRENCES = ["ONE_TIME", "DAILY"] as const;
export type CustomTaskRecurrence = (typeof CUSTOM_TASK_RECURRENCES)[number];
export function isCustomTaskRecurrence(value: unknown): value is CustomTaskRecurrence {
  return typeof value === "string" && (CUSTOM_TASK_RECURRENCES as readonly string[]).includes(value);
}

export const REWARD_CATEGORIES = ["SKIN", "AVATAR", "POWER"] as const;
export type RewardCategory = (typeof REWARD_CATEGORIES)[number];
export function isRewardCategory(value: unknown): value is RewardCategory {
  return typeof value === "string" && (REWARD_CATEGORIES as readonly string[]).includes(value);
}

export const RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;
export type Rarity = (typeof RARITIES)[number];
export function isRarity(value: unknown): value is Rarity {
  return typeof value === "string" && (RARITIES as readonly string[]).includes(value);
}

export const POWER_KEYS = ["TOMORROW_PREVIEW", "FRESH_PICK"] as const;
export type PowerKey = (typeof POWER_KEYS)[number];
export function isPowerKey(value: unknown): value is PowerKey {
  return typeof value === "string" && (POWER_KEYS as readonly string[]).includes(value);
}

export const CHALLENGE_DIFFICULTIES = ["EASY", "MODERATE", "HARD"] as const;
export type ChallengeDifficulty = (typeof CHALLENGE_DIFFICULTIES)[number];
export function isChallengeDifficulty(value: unknown): value is ChallengeDifficulty {
  return typeof value === "string" && (CHALLENGE_DIFFICULTIES as readonly string[]).includes(value);
}

export const CHALLENGE_PROOF_TYPES = ["CHECKBOX", "CAPTION"] as const;
export type ChallengeProofType = (typeof CHALLENGE_PROOF_TYPES)[number];
