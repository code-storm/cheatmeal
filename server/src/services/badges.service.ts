import type { Prisma, PregnancyProfile } from "@prisma/client";
import { computeCurrentWeek } from "./pregnancyWeek.service";

type TxClient = Prisma.TransactionClient;

export interface UnlockedBadgeDTO {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

// `profile` is fetched once by the caller (checkAndAwardBadges) rather than
// per-branch here - each extra findUnique inside this function used to be
// its own network round-trip to the database, and against a networked
// Turso database (not a local SQLite file) that added up across the up to
// 13 badges checked per call, enough to blow the transaction's timeout.
async function isCriteriaMet(
  tx: TxClient,
  userId: string,
  criteriaKey: string,
  profile: PregnancyProfile | null
): Promise<boolean> {
  switch (criteriaKey) {
    case "FIRST_TASK": {
      const [taskCount, instanceCount] = await Promise.all([
        tx.dailyTask.count({ where: { dailyPlan: { userId }, status: "COMPLETED" } }),
        tx.customTaskInstance.count({ where: { dailyPlan: { userId }, status: "COMPLETED" } }),
      ]);
      return taskCount + instanceCount >= 1;
    }
    case "PERFECT_DAY": {
      const plans = await tx.dailyPlan.findMany({
        where: { userId },
        include: {
          tasks: { select: { status: true } },
          customTaskInstances: { select: { status: true } },
        },
      });
      return plans.some((plan) => {
        const all = [...plan.tasks, ...plan.customTaskInstances];
        return all.length > 0 && all.every((t) => t.status === "COMPLETED");
      });
    }
    case "STREAK_7":
      return (profile?.longestStreak ?? 0) >= 7;
    case "STREAK_30":
      return (profile?.longestStreak ?? 0) >= 30;
    case "CHALLENGE_ROOKIE": {
      const count = await tx.dailyChallengeInstance.count({ where: { userId, status: "COMPLETED" } });
      return count >= 1;
    }
    case "CHALLENGE_CHAMPION": {
      const count = await tx.dailyChallengeInstance.count({ where: { userId, status: "COMPLETED" } });
      return count >= 25;
    }
    case "FIRST_REWARD_UNLOCK": {
      const count = await tx.userReward.count({ where: { userId } });
      return count >= 1;
    }
    case "CUSTOM_CREATOR": {
      const count = await tx.customTask.count({ where: { userId } });
      return count >= 1;
    }
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
  const [allBadges, userBadges, profile] = await Promise.all([
    tx.badge.findMany({ where: { isActive: true } }),
    tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    tx.pregnancyProfile.findUnique({ where: { userId } }),
  ]);

  const unlockedIds = new Set(userBadges.map((ub) => ub.badgeId));
  const candidates = allBadges.filter((b) => !unlockedIds.has(b.id));
  if (candidates.length === 0) return [];

  const newlyUnlocked: UnlockedBadgeDTO[] = [];

  for (const badge of candidates) {
    const met = await isCriteriaMet(tx, userId, badge.criteriaKey, profile);
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
