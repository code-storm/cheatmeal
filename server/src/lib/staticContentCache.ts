import type { Badge, RewardItem, TaskTemplate, FoodAvoidRule, ActivityAvoidRule, DailyChallengeTemplate } from "@prisma/client";
import { prisma } from "./prisma";

// In-process cache for content tables that are seeded once
// (server/prisma/seed.ts) and have no runtime write path anywhere in
// routes/ or services/ - confirmed by repo-wide grep. The only way their
// contents change is a manual reseed, which is a deploy-time operation
// (fresh process) in this app's actual workflow, so there's no staleness
// risk and no invalidation logic is needed. Each getter lazily memoizes
// a single in-flight Promise so concurrent requests during cold start
// share one fetch instead of each issuing their own.
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

let activeRewardItemsCache: Promise<RewardItem[]> | null = null;
export function getActiveRewardItems(): Promise<RewardItem[]> {
  activeRewardItemsCache ??= prisma.rewardItem.findMany({ where: { isActive: true } });
  return activeRewardItemsCache;
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
