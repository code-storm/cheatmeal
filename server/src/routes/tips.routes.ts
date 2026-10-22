import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { computeCurrentWeek, trimesterForWeek } from "../services/pregnancyWeek.service";
import { pregnancyTips } from "../content/tips";

const router = Router();

router.get("/tips/today", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const profile = await prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(400).json({ error: "Profile required" });
      return;
    }

    const currentWeek = computeCurrentWeek(profile.lmpDate, new Date());
    const trimester = trimesterForWeek(currentWeek);

    const tips = pregnancyTips.filter((tip) => tip.trimester === trimester);
    res.json({ tips });
  } catch (err) {
    next(err);
  }
});

export default router;
