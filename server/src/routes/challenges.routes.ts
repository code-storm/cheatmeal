import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { getOrCreateDailyChallenges } from "../services/challengeGenerator.service";
import { awardPoints } from "../services/points.service";
import { checkAndAwardBadges } from "../services/badges.service";
import { isTaskStatus } from "../lib/enums";

const router = Router();

function todayDateStrLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

router.get("/challenges/today", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const challenges = await getOrCreateDailyChallenges(userId, todayDateStrLocal());
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
});

router.patch("/challenges/instance/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params;
    const { status, proofCaption } = req.body as { status?: unknown; proofCaption?: unknown };

    if (!isTaskStatus(status)) {
      res.status(400).json({ error: "status must be one of PENDING, COMPLETED, SKIPPED." });
      return;
    }
    if (proofCaption !== undefined && typeof proofCaption !== "string") {
      res.status(400).json({ error: "proofCaption must be a string." });
      return;
    }

    const instance = await prisma.dailyChallengeInstance.findUnique({ where: { id } });
    if (!instance) {
      res.status(404).json({ error: "Challenge not found." });
      return;
    }
    if (instance.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const previousStatus = instance.status;

    if (status === "COMPLETED" && instance.proofType === "CAPTION") {
      const caption = typeof proofCaption === "string" ? proofCaption.trim() : "";
      if (caption.length < 1) {
        res.status(400).json({ error: "This challenge needs a short caption to complete." });
        return;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.dailyChallengeInstance.update({
        where: { id },
        data: {
          status,
          proofCaption: typeof proofCaption === "string" ? proofCaption.trim() : instance.proofCaption,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      let newBadges: Awaited<ReturnType<typeof checkAndAwardBadges>> = [];
      if (previousStatus !== "COMPLETED" && status === "COMPLETED") {
        await awardPoints(tx, userId, instance.bonusPoints);
        newBadges = await checkAndAwardBadges(tx, userId);
      }

      const profile = await tx.pregnancyProfile.findUnique({ where: { userId } });
      return { challenge: updated, pointsBalance: profile?.pointsBalance ?? 0, newBadges };
    }, { timeout: 15000 });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
