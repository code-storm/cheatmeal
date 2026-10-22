import { getActiveRewardItems } from "../lib/staticContentCache";

const EPOCH_MONDAY = new Date("2026-01-05T00:00:00Z");
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export const FEATURED_SKIN_DISCOUNT_PCT = 0.25;

/**
 * Deterministically rotates which SKIN is "featured" this week - a pure
 * function of (now, the ordered catalog), recomputed per request rather
 * than stored, since this app has no background job runner that could
 * flip a persisted flag weekly. Ordering by slug (not insertion order)
 * keeps the rotation stable regardless of reseed order.
 */
export async function getFeaturedSkinSlug(): Promise<string | null> {
  const allItems = await getActiveRewardItems();
  const skins = allItems.filter((item) => item.category === "SKIN").sort((a, b) => a.slug.localeCompare(b.slug));
  if (skins.length === 0) return null;

  const weekIndex = Math.floor((Date.now() - EPOCH_MONDAY.getTime()) / MS_PER_WEEK) % skins.length;
  return skins[weekIndex].slug;
}

export function effectiveCostFor(costPoints: number, isFeatured: boolean): number {
  return isFeatured ? Math.round(costPoints * (1 - FEATURED_SKIN_DISCOUNT_PCT)) : costPoints;
}
