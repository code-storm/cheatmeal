import type { Badge, RewardItem, TaskTemplate, FoodAvoidRule, ActivityAvoidRule, DailyChallengeTemplate } from "@prisma/client";
import { prisma } from "./prisma";

// In-process cache for content tables seeded via server/prisma/seed.ts.
// getActiveBadges()/getActiveRewardItems() now have exactly one runtime
// write path - the admin portal's adminBadges.routes.ts/
// adminRewards.routes.ts - which calls the matching invalidator below
// after every mutation; every other getter in this file genuinely has no
// write path anywhere (confirmed by repo-wide grep) and stays eternal, no
// invalidation needed. Each getter lazily memoizes a single in-flight
// Promise so concurrent requests during cold start share one fetch
// instead of each issuing their own.
//
// These reads intentionally go through the top-level `prisma` client, not
// a transaction's `tx` - correct specifically because this data never
// changes at request time, so there's no correctness reason it needs to
// be read through an enclosing transaction's snapshot.
//
// MUST be warmed via warmStaticContentCache() before the server starts
// accepting requests (see index.ts) - @prisma/adapter-libsql serializes
// all queries on the single shared connection behind a mutex, including
// queries made through the top-level `prisma` client while a `tx`
// transaction is open. If a cache getter's FIRST-EVER call happens from
// inside checkAndAwardBadges (itself inside a $transaction), that
// top-level query queues behind the transaction's own held connection
// while the transaction is simultaneously awaiting that same query to
// resolve - a real deadlock, observed directly: the transaction only
// unblocks once its own timeout (15s) forcibly tears it down. Pre-warming
// every getter at startup means the Promise is already settled long
// before any transaction could ever reference it.

let activeBadgesCache: Promise<Badge[]> | null = null;
export function getActiveBadges(): Promise<Badge[]> {
  activeBadgesCache ??= prisma.badge.findMany({ where: { isActive: true } });
  return activeBadgesCache;
}

// Called after every admin Badge create/update (adminBadges.routes.ts) so
// the next getActiveBadges() read reflects the write instead of serving
// the pre-warmed (or previously-refetched) snapshot forever. Safe to call
// from a plain route handler outside any transaction - it only clears the
// in-memory reference; the next getter call issues a fresh top-level
// `prisma` query, same as the very first warm-up call did, so this can
// never recreate the cold-cache-inside-transaction deadlock described
// above (that hazard is specifically about a cache's FIRST-EVER read
// happening inside an open $transaction - this is neither).
export function invalidateActiveBadgesCache(): void {
  activeBadgesCache = null;
}

let activeRewardItemsCache: Promise<RewardItem[]> | null = null;
export function getActiveRewardItems(): Promise<RewardItem[]> {
  activeRewardItemsCache ??= prisma.rewardItem.findMany({ where: { isActive: true } });
  return activeRewardItemsCache;
}

// See invalidateActiveBadgesCache() above - same rationale, called after
// every admin RewardItem create/update (adminRewards.routes.ts).
export function invalidateActiveRewardItemsCache(): void {
  activeRewardItemsCache = null;
}

let activeTaskTemplatesCache: Promise<TaskTemplate[]> | null = null;
export function getActiveTaskTemplates(): Promise<TaskTemplate[]> {
  activeTaskTemplatesCache ??= prisma.taskTemplate.findMany({ where: { isActive: true } });
  return activeTaskTemplatesCache;
}

let foodAvoidRulesCache: Promise<FoodAvoidRule[]> | null = null;
export function getFoodAvoidRules(): Promise<FoodAvoidRule[]> {
  foodAvoidRulesCache ??= prisma.foodAvoidRule.findMany();
  return foodAvoidRulesCache;
}

let activityAvoidRulesCache: Promise<ActivityAvoidRule[]> | null = null;
export function getActivityAvoidRules(): Promise<ActivityAvoidRule[]> {
  activityAvoidRulesCache ??= prisma.activityAvoidRule.findMany();
  return activityAvoidRulesCache;
}

let activeChallengeTemplatesCache: Promise<DailyChallengeTemplate[]> | null = null;
export function getActiveChallengeTemplates(): Promise<DailyChallengeTemplate[]> {
  activeChallengeTemplatesCache ??= prisma.dailyChallengeTemplate.findMany({ where: { isActive: true } });
  return activeChallengeTemplatesCache;
}

/**
 * Populates every cache getter above and waits for all of them to
 * resolve. Must be called once, before the server starts accepting
 * requests - see the deadlock note above.
 */
export async function warmStaticContentCache(): Promise<void> {
  await Promise.all([
    getActiveBadges(),
    getActiveRewardItems(),
    getActiveTaskTemplates(),
    getFoodAvoidRules(),
    getActivityAvoidRules(),
    getActiveChallengeTemplates(),
  ]);
}
