import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

/**
 * Award points to a user's spendable balance and lifetime-earned counter.
 * Must be called inside the same transaction as the status change that
 * triggered the award, so the two always move together.
 */
export async function awardPoints(tx: TxClient, userId: string, points: number): Promise<void> {
  if (points <= 0) return;
  await tx.pregnancyProfile.update({
    where: { userId },
    data: {
      pointsBalance: { increment: points },
      totalPointsEarned: { increment: points },
    },
  });
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
}
