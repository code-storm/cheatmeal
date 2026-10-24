import type { Prisma, Event } from "@prisma/client";
import { getEvents } from "../lib/eventCache";
import { lifecycleStageFor, resolveEventTiers } from "./events.service";
import { getActiveRewardItems } from "../lib/staticContentCache";

type TxClient = Prisma.TransactionClient;

/**
 * Award points to a user's spendable balance and lifetime-earned counter.
 * Must be called inside the same transaction as the status change that
 * triggered the award, so the two always move together.
 *
 * Also credits progress toward any currently-active (ACTIVE/ENDING_SOON)
 * crossover event's tier ladder - see creditEventProgress below. Callers
 * that already fetched getEvents() for their own purposes (e.g. the
 * rewards-unlock purchasability check) may pass that same list via
 * `activeEvents` to skip a redundant fetch; most callers can omit it and
 * get a safe default.
 */
export async function awardPoints(
  tx: TxClient,
  userId: string,
  points: number,
  activeEvents?: Event[]
): Promise<void> {
  if (points <= 0) return;
  await tx.pregnancyProfile.update({
    where: { userId },
    data: {
      pointsBalance: { increment: points },
      totalPointsEarned: { increment: points },
    },
  });

  // getEvents() is read through the top-level `prisma` client (see
  // eventCache.ts) from inside this open transaction - the exact shape
  // that caused this app's documented adapter-mutex deadlock before, when
  // a cache getter's FIRST-EVER call happened from inside a transaction.
  // Mitigated the same way as staticContentCache.ts: getEvents() is
  // warmed once at boot (index.ts), so it is never cold on its first
  // touch here, regardless of when this function first runs.
  const events = activeEvents ?? (await getEvents()).filter((e) => {
    const stage = lifecycleStageFor(e);
    return stage === "ACTIVE" || stage === "ENDING_SOON";
  });

  for (const event of events) {
    await creditEventProgress(tx, userId, event, points);
  }
}

/**
 * Revert points from a user's spendable balance only - totalPointsEarned is
 * a lifetime stat and never decreases, even when a completion is undone.
 * Balance is clamped at 0 so repeated toggling can never go negative.
 */
export async function revertPoints(tx: TxClient, userId: string, points: number): Promise<void> {
  if (points <= 0) return;
  const profile = await tx.pregnancyProfile.findUnique({ where: { userId } });
  if (!profile) return;
  const newBalance = Math.max(0, profile.pointsBalance - points);
  await tx.pregnancyProfile.update({
    where: { userId },
    data: { pointsBalance: newBalance },
  });
  // Deliberately NOT reverting EventProgress.pointsEarnedDuringEvent or
  // claimed tiers - mirrors totalPointsEarned's own "never decreases"
  // rule. A tier reward, once granted, is kept even if the task that
  // pushed the user over its threshold is later un-completed - same
  // "don't claw back what was already given" principle as every other
  // unlock in this app (UserReward/UserBadge rows are never deleted on
  // revert).
}

/**
 * Upserts EventProgress.pointsEarnedDuringEvent for one active event, then
 * grants any tier reward whose threshold was just crossed for the first
 * time (checked against claimedTiers so a threshold can never grant
 * twice). Same "evaluate then grant inside the triggering transaction"
 * idiom as checkAndAwardBadges.
 */
async function creditEventProgress(tx: TxClient, userId: string, event: Event, points: number): Promise<void> {
  const progress = await tx.eventProgress.upsert({
    where: { userId_eventId: { userId, eventId: event.id } },
    update: { pointsEarnedDuringEvent: { increment: points } },
    create: { userId, eventId: event.id, pointsEarnedDuringEvent: points },
  });

  const tiers = await resolveEventTiers(tx, event);
  // tiers is the resolved { tier, pointsRequired, rewardItemSlug }[]
  // shape from events.service.ts's two-branch fallback (static
  // content/events.ts first, else the persisted EventTier table) - this
  // function's logic below is unchanged by which source it came from.
  if (tiers.length === 0) return;

  const claimedTiers = new Set(
    progress.claimedTiers.split(",").filter(Boolean).map((t) => Number(t))
  );
  const newlyCrossed = tiers.filter(
    (tier) => !claimedTiers.has(tier.tier) && progress.pointsEarnedDuringEvent >= tier.pointsRequired
  );
  if (newlyCrossed.length === 0) return;

  const allItems = await getActiveRewardItems();
  for (const tier of newlyCrossed) {
    const rewardItem = allItems.find((i) => i.slug === tier.rewardItemSlug);
    if (!rewardItem) continue;
    const alreadyOwned = await tx.userReward.findUnique({
      where: { userId_rewardItemId: { userId, rewardItemId: rewardItem.id } },
    });
    if (!alreadyOwned) {
      await tx.userReward.create({ data: { userId, rewardItemId: rewardItem.id } });
    }
    claimedTiers.add(tier.tier);
  }

  await tx.eventProgress.update({
    where: { userId_eventId: { userId, eventId: event.id } },
    data: {
      claimedTiers: Array.from(claimedTiers).sort((a, b) => a - b).join(","),
      tierReached: Math.max(...claimedTiers),
    },
  });
}
