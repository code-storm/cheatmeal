import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

function shiftDateStr(dateStr: string, deltaDays: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Credits one streak-day for the given date, at most once per date.
 * Must be called inside the same transaction as the completion that
 * triggered it, only on transitioning a task INTO COMPLETED - never
 * reverted on leaving COMPLETED, mirroring this project's stance that
 * undoing a single action should not retroactively punish progress.
 *
 * Grace tokens auto-bridge exactly one missed day: if the gap since
 * lastStreakDate is precisely one real missed day (dateStr is 2 days after
 * lastStreakDate) and the profile has a token available, the gap is
 * treated as if it were only 1 day (streak continues) and one token is
 * spent. A 2+-day gap with no tokens left falls through to the existing
 * reset-to-1 behavior unchanged. Consumption is automatic, never
 * user-chosen - the point of the mechanic is removing streak-loss anxiety,
 * which asking the user to decide would reintroduce.
 *
 * Returns whether a grace token was consumed this call, so callers can
 * surface a toast without a second read.
 */
export async function recordStreakActivity(
  tx: TxClient,
  userId: string,
  dateStr: string
): Promise<{ graceTokenConsumed: boolean }> {
  const profile = await tx.pregnancyProfile.findUnique({ where: { userId } });
  if (!profile || profile.lastStreakDate === dateStr) return { graceTokenConsumed: false };

  const yesterday = shiftDateStr(dateStr, -1);
  const oneMissedDayAgo = shiftDateStr(dateStr, -2);

  const continuesNaturally = profile.lastStreakDate === yesterday;
  const canBridgeOneMissedDay =
    !continuesNaturally && profile.lastStreakDate === oneMissedDayAgo && profile.streakGraceTokens > 0;

  const nextStreak = continuesNaturally || canBridgeOneMissedDay ? profile.currentStreak + 1 : 1;

  await tx.pregnancyProfile.update({
    where: { userId },
    data: {
      currentStreak: nextStreak,
      longestStreak: Math.max(nextStreak, profile.longestStreak),
      lastStreakDate: dateStr,
      ...(canBridgeOneMissedDay ? { streakGraceTokens: { decrement: 1 } } : {}),
    },
  });

  return { graceTokenConsumed: canBridgeOneMissedDay };
}
