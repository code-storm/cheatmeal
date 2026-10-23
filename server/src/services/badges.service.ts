import type { Prisma, PregnancyProfile } from "@prisma/client";
import { computeCurrentWeek } from "./pregnancyWeek.service";
import { getActiveBadges, getActiveRewardItems } from "../lib/staticContentCache";

type TxClient = Prisma.TransactionClient;

export interface UnlockedBadgeDTO {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

// Each criteria key's shared data is fetched at most once per
// checkAndAwardBadges call, in parallel with every other key the
// *remaining candidate* badges actually need - not once per candidate
// badge in a sequential loop (what made this function's round-trip count
// scale with how many of the ~13 badges were still unearned), and not
// unconditionally for keys no remaining candidate needs (most users will
// have already permanently unlocked badges like FIRST_TASK/CUSTOM_CREATOR
// early on, so re-running their queries - PERFECT_DAY's in particular,
// a full history scan - on every later completion would be wasteful).
const PROFILE_DEPENDENT_KEYS = new Set([
  "STREAK_7",
  "STREAK_30",
  "CENTURION",
  "TRIMESTER_2_REACHED",
  "WEEK_20_HALFWAY",
  "TRIMESTER_3_REACHED",
  "FULL_TERM_REACHED",
]);

interface CriteriaContext {
  profile?: PregnancyProfile | null;
  completedTaskOrInstanceCount?: number;
  hasPerfectDay?: boolean;
  completedChallengeCount?: number;
  userRewardCount?: number;
  customTaskCount?: number;
  // Per-event owned-item counts, keyed by eventId - one query serves
  // every EVENT_SET_COMPLETE/EVENT_FIRST_ITEM badge ever added, rather
  // than one query per event (same round-trip discipline as the rest of
  // this function).
  ownedCountByEventId?: Map<string, number>;
}

const EVENT_SCOPED_KEYS = ["EVENT_SET_COMPLETE", "EVENT_FIRST_ITEM"];

async function computeCriteriaContext(
  tx: TxClient,
  userId: string,
  candidateCriteriaKeys: Set<string>
): Promise<CriteriaContext> {
  const needs = (...keys: string[]) => keys.some((k) => candidateCriteriaKeys.has(k));

  const [profile, taskCounts, plans, completedChallengeCount, userRewardCount, customTaskCount, eventOwnedRows] =
    await Promise.all([
      needs(...PROFILE_DEPENDENT_KEYS) ? tx.pregnancyProfile.findUnique({ where: { userId } }) : undefined,
      needs("FIRST_TASK")
        ? Promise.all([
            tx.dailyTask.count({ where: { dailyPlan: { userId }, status: "COMPLETED" } }),
            tx.customTaskInstance.count({ where: { dailyPlan: { userId }, status: "COMPLETED" } }),
          ])
        : undefined,
      needs("PERFECT_DAY")
        ? tx.dailyPlan.findMany({
            where: { userId },
            include: {
              tasks: { select: { status: true } },
              customTaskInstances: { select: { status: true } },
            },
          })
        : undefined,
      needs("CHALLENGE_ROOKIE", "CHALLENGE_CHAMPION")
        ? tx.dailyChallengeInstance.count({ where: { userId, status: "COMPLETED" } })
        : undefined,
      needs("FIRST_REWARD_UNLOCK") ? tx.userReward.count({ where: { userId } }) : undefined,
      needs("CUSTOM_CREATOR") ? tx.customTask.count({ where: { userId } }) : undefined,
      needs(...EVENT_SCOPED_KEYS)
        ? tx.userReward.findMany({
            where: { userId, rewardItem: { eventId: { not: null } } },
            select: { rewardItem: { select: { eventId: true } } },
          })
        : undefined,
    ]);

  const ownedCountByEventId = eventOwnedRows
    ? eventOwnedRows.reduce((map, row) => {
        const eventId = row.rewardItem.eventId as string;
        map.set(eventId, (map.get(eventId) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
    : undefined;

  return {
    profile,
    completedTaskOrInstanceCount: taskCounts ? taskCounts[0] + taskCounts[1] : undefined,
    hasPerfectDay: plans?.some((plan) => {
      const all = [...plan.tasks, ...plan.customTaskInstances];
      return all.length > 0 && all.every((t) => t.status === "COMPLETED");
    }),
    completedChallengeCount,
    userRewardCount,
    customTaskCount,
    ownedCountByEventId,
  };
}

function isCriteriaMet(
  criteriaKey: string,
  ctx: CriteriaContext,
  badgeEventId: string | null,
  eventItemCountByEventId: Map<string, number>
): boolean {
  const { profile } = ctx;
  switch (criteriaKey) {
    case "FIRST_TASK":
      return (ctx.completedTaskOrInstanceCount ?? 0) >= 1;
    case "PERFECT_DAY":
      return ctx.hasPerfectDay ?? false;
    case "STREAK_7":
      return (profile?.longestStreak ?? 0) >= 7;
    case "STREAK_30":
      return (profile?.longestStreak ?? 0) >= 30;
    case "CHALLENGE_ROOKIE":
      return (ctx.completedChallengeCount ?? 0) >= 1;
    case "CHALLENGE_CHAMPION":
      return (ctx.completedChallengeCount ?? 0) >= 25;
    case "FIRST_REWARD_UNLOCK":
      return (ctx.userRewardCount ?? 0) >= 1;
    case "CUSTOM_CREATOR":
      return (ctx.customTaskCount ?? 0) >= 1;
    case "CENTURION":
      return (profile?.totalPointsEarned ?? 0) >= 100;
    // Journey milestones: time-based (tied to the real pregnancy calendar),
    // not action-based like every other criteria here - can become true
    // without the user doing anything, so there may be a short lag before
    // the next action call site evaluates it. Accepted trade; see
    // badges.ts content comments.
    case "TRIMESTER_2_REACHED":
      return profile ? computeCurrentWeek(profile.lmpDate, new Date()) >= 14 : false;
    case "WEEK_20_HALFWAY":
      return profile ? computeCurrentWeek(profile.lmpDate, new Date()) >= 20 : false;
    case "TRIMESTER_3_REACHED":
      return profile ? computeCurrentWeek(profile.lmpDate, new Date()) >= 28 : false;
    case "FULL_TERM_REACHED":
      return profile ? computeCurrentWeek(profile.lmpDate, new Date()) >= 37 : false;
    // Crossover-event badges: the badge's OWN eventId is the implicit
    // parameter (no string-parsing needed), so any future event's
    // participation/completionist badge works with zero code change -
    // only its content-file eventSlug needs to be set.
    case "EVENT_FIRST_ITEM":
      if (!badgeEventId) return false;
      return (ctx.ownedCountByEventId?.get(badgeEventId) ?? 0) >= 1;
    case "EVENT_SET_COMPLETE": {
      if (!badgeEventId) return false;
      const totalEventItems = eventItemCountByEventId.get(badgeEventId) ?? 0;
      if (totalEventItems === 0) return false;
      return (ctx.ownedCountByEventId?.get(badgeEventId) ?? 0) >= totalEventItems;
    }
    default:
      return false;
  }
}

/**
 * Evaluates every active badge the user hasn't unlocked yet and awards any
 * newly-met ones. Must be called inside the same transaction as the action
 * that might have unlocked them (task completion, challenge completion,
 * reward unlock, custom task creation). Returns only the badges unlocked
 * on THIS call, so callers can surface a toast without re-fetching.
 */
export async function checkAndAwardBadges(tx: TxClient, userId: string): Promise<UnlockedBadgeDTO[]> {
  const [allBadges, userBadges, allRewardItems] = await Promise.all([
    getActiveBadges(),
    tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    getActiveRewardItems(),
  ]);

  const unlockedIds = new Set(userBadges.map((ub) => ub.badgeId));
  const candidates = allBadges.filter((b) => !unlockedIds.has(b.id));
  if (candidates.length === 0) return [];

  const ctx = await computeCriteriaContext(tx, userId, new Set(candidates.map((b) => b.criteriaKey)));

  // Total item count per event, from the already-cached catalog - no
  // extra query. Used by EVENT_SET_COMPLETE to know what "the full set"
  // means for any given event (every RewardItem scoped to it, matching
  // the badge copy's "collected every item" literally).
  const eventItemCountByEventId = allRewardItems.reduce((map, item) => {
    if (!item.eventId) return map;
    map.set(item.eventId, (map.get(item.eventId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const newlyUnlocked: UnlockedBadgeDTO[] = [];

  for (const badge of candidates) {
    const met = isCriteriaMet(badge.criteriaKey, ctx, badge.eventId, eventItemCountByEventId);
    if (met) {
      await tx.userBadge.create({ data: { userId, badgeId: badge.id } });
      newlyUnlocked.push({
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
    }
  }

  return newlyUnlocked;
}
