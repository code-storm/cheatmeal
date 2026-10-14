import type { ItemType, MealSlot } from "../lib/enums";

// Shape mirrors the TaskTemplate Prisma model closely enough for seeding.
// `id`, `isActive`, `createdAt` are left to Prisma defaults.
export interface TaskTemplateSeed {
  slug: string;
  type: ItemType;
  mealSlot?: MealSlot;
  defaultTime: string; // "HH:mm"
  name: string;
  description: string;
  instructions?: string;
  minWeek: number;
  maxWeek: number;
  nutrientTags: string; // comma-separated, no spaces
  rotationPoolKey?: string; // e.g. "T1_BREAKFAST"
}
