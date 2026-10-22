import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { isDietPreference } from "../lib/enums";

const router = Router();

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

router.post("/onboarding/profile", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { age, prePregnancyWeightKg, heightCm, currentPregnancyWeek, dietPreference } = req.body as {
      age?: unknown;
      prePregnancyWeightKg?: unknown;
      heightCm?: unknown;
      currentPregnancyWeek?: unknown;
      dietPreference?: unknown;
    };

    if (!isFiniteNumber(age) || age < 13 || age > 55) {
      res.status(400).json({ error: "Age must be a number between 13 and 55." });
      return;
    }
    if (!isFiniteNumber(prePregnancyWeightKg) || prePregnancyWeightKg < 30 || prePregnancyWeightKg > 200) {
      res.status(400).json({ error: "Pre-pregnancy weight must be a number between 30 and 200 kg." });
      return;
    }
    if (heightCm !== undefined && heightCm !== null && !isFiniteNumber(heightCm)) {
      res.status(400).json({ error: "Height must be a number if provided." });
      return;
    }
    if (!isFiniteNumber(currentPregnancyWeek) || currentPregnancyWeek < 1 || currentPregnancyWeek > 45) {
      res.status(400).json({ error: "Current pregnancy week must be a number between 1 and 45." });
      return;
    }
    if (!isDietPreference(dietPreference)) {
      res
        .status(400)
        .json({ error: "dietPreference must be one of VEGETARIAN, EGGETARIAN, NON_VEGETARIAN, NO_RESTRICTION." });
      return;
    }

    const existing = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (existing) {
      res.status(409).json({ error: "A pregnancy profile already exists for this account." });
      return;
    }

    const signupDate = new Date();
    const lmpDate = new Date(signupDate.getTime() - currentPregnancyWeek * 7 * 24 * 60 * 60 * 1000);

    const profile = await prisma.pregnancyProfile.create({
      data: {
        userId,
        age,
        prePregnancyWeightKg,
        heightCm: heightCm ?? null,
        weekAtSignup: currentPregnancyWeek,
        signupDate,
        lmpDate,
        dietPreference,
      },
    });

    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
});

export default router;
