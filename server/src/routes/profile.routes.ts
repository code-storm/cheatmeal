import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { computeCurrentWeek, trimesterForWeek } from "../services/pregnancyWeek.service";

const router = Router();

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

router.get("/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: "No pregnancy profile found for this account." });
      return;
    }

    const currentPregnancyWeek = computeCurrentWeek(profile.lmpDate, new Date());
    const trimester = trimesterForWeek(currentPregnancyWeek);

    res.json({ profile, currentPregnancyWeek, trimester });
  } catch (err) {
    next(err);
  }
});

router.patch("/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { currentWeightKg } = req.body as { currentWeightKg?: unknown };

    if (currentWeightKg !== undefined) {
      if (!isFiniteNumber(currentWeightKg) || currentWeightKg < 30 || currentWeightKg > 200) {
        res.status(400).json({ error: "currentWeightKg must be a number between 30 and 200 kg." });
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
      },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

export default router;
