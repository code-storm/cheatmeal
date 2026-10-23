import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { computeCurrentWeek, trimesterForWeek } from "../services/pregnancyWeek.service";
import { isDietPreference } from "../lib/enums";
import { awardPoints } from "../services/points.service";
import { LOGIN_BONUS_POINTS } from "../content/points";
import { levelForPoints } from "../content/levels";
import { getActiveRewardItems } from "../lib/staticContentCache";

const router = Router();

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function todayDateStrLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentMonthStrLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const GRACE_TOKENS_PER_MONTH = 2;

router.get("/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    let profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: "No pregnancy profile found for this account." });
      return;
    }

    const todayStr = todayDateStrLocal();
    let loginBonusAwarded: { points: number } | undefined;

    if (profile.lastLoginBonusDate !== todayStr) {
      profile = await prisma.$transaction(async (tx) => {
        await awardPoints(tx, userId, LOGIN_BONUS_POINTS);
        return tx.pregnancyProfile.update({
          where: { userId },
          data: { lastLoginBonusDate: todayStr },
        });
      }, { timeout: 15000 });
      loginBonusAwarded = { points: LOGIN_BONUS_POINTS };
    }

    // Passive monthly grace-token grant, checked lazily the same way as the
    // login bonus above. Deliberately outside the points transaction/
    // economy - a streak safety net isn't something to purchase or earn,
    // see streak.service.ts.
    const currentMonthStr = currentMonthStrLocal();
    if (profile.lastGraceGrantDate !== currentMonthStr) {
      profile = await prisma.pregnancyProfile.update({
        where: { userId },
        data: {
          streakGraceTokens: { increment: GRACE_TOKENS_PER_MONTH },
          lastGraceGrantDate: currentMonthStr,
        },
      });
    }

    const currentPregnancyWeek = computeCurrentWeek(profile.lmpDate, new Date());
    const trimester = trimesterForWeek(currentPregnancyWeek);
    const level = levelForPoints(profile.totalPointsEarned);

    // Resolves the active avatar's real art/icon from the already-cached
    // catalog (no extra query) - lets the header show real illustrated
    // avatars (e.g. the Tokidoki mascot) instead of being limited to a
    // hardcoded emoji lookup table on the client.
    let activeAvatar: { icon: string; imageUrl: string | null } | null = null;
    if (profile.activeAvatarSlug) {
      const items = await getActiveRewardItems();
      const item = items.find((i) => i.slug === profile!.activeAvatarSlug);
      if (item) activeAvatar = { icon: item.icon, imageUrl: item.imageUrl };
    }

    res.json({
      profile,
      currentPregnancyWeek,
      trimester,
      level,
      activeAvatar,
      ...(loginBonusAwarded ? { loginBonusAwarded } : {}),
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { currentWeightKg, dietPreference } = req.body as {
      currentWeightKg?: unknown;
      dietPreference?: unknown;
    };

    if (currentWeightKg !== undefined) {
      if (!isFiniteNumber(currentWeightKg) || currentWeightKg < 30 || currentWeightKg > 200) {
        res.status(400).json({ error: "currentWeightKg must be a number between 30 and 200 kg." });
        return;
      }
    }
    if (dietPreference !== undefined) {
      if (!isDietPreference(dietPreference)) {
        res
          .status(400)
          .json({ error: "dietPreference must be one of VEGETARIAN, EGGETARIAN, NON_VEGETARIAN, NO_RESTRICTION." });
        return;
      }
    }

    const existing = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!existing) {
      res.status(404).json({ error: "No pregnancy profile found for this account." });
      return;
    }

    const profile = await prisma.pregnancyProfile.update({
      where: { userId },
      data: {
        ...(currentWeightKg !== undefined ? { currentWeightKg } : {}),
        ...(dietPreference !== undefined ? { dietPreference } : {}),
      },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

export default router;
