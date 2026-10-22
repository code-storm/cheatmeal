import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { getActiveBadges } from "../lib/staticContentCache";

const router = Router();

router.get("/badges", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;

    const [items, userBadges] = await Promise.all([
      getActiveBadges(),
      prisma.userBadge.findMany({ where: { userId } }),
    ]);

    const unlockedByBadgeId = new Map(userBadges.map((ub) => [ub.badgeId, ub.unlockedAt]));

    res.json({
      items: items.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description,
        icon: item.icon,
        criteriaKey: item.criteriaKey,
        unlocked: unlockedByBadgeId.has(item.id),
        unlockedAt: unlockedByBadgeId.get(item.id)?.toISOString() ?? null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
