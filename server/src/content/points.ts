import type { ItemType } from "../lib/enums";

// Reference points-per-completion by task type. Exercise is weighted highest
// to nudge engagement toward movement; meals/habits/grooming share a lower
// flat rate. Custom tasks always award a flat amount regardless of their
// (purely cosmetic) type badge.
export const POINTS_BY_TASK_TYPE: Record<ItemType, number> = {
  MEAL: 5,
  EXERCISE: 15,
  HABIT: 5,
  GROOMING: 5,
};

export const CUSTOM_TASK_POINTS = 10;

export const LOGIN_BONUS_POINTS = 5;

export const CHALLENGE_BONUS_POINTS: Record<"EASY" | "MODERATE" | "HARD", number> = {
  EASY: 10,
  MODERATE: 20,
  HARD: 35,
};
