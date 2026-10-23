import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { getActiveBadges } from "../lib/staticContentCache";
import { getEvents } from "../lib/eventCache";
import { lifecycleStageFor } from "../services/events.service";

const router = Router();

router.get("/badges", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;

    const [items, userBadges, events] = await Promise.all([
      getActiveBadges(),
      prisma.userBadge.findMany({ where: { userId } }),
      getEvents(),
    ]);

    const unlockedByBadgeId = new Map(userBadges.map((ub) => [ub.badgeId, ub.unlockedAt]));
    const eventsById = new Map(events.map((e) => [e.id, e]));

    res.json({
      items: items.map((item) => {
        const event = item.eventId ? eventsById.get(item.eventId) : undefined;
        return {
          slug: item.slug,
          name: item.name,
          description: item.description,
          icon: item.icon,
          imageUrl: item.imageUrl,
          criteriaKey: item.criteriaKey,
          unlocked: unlockedByBadgeId.has(item.id),
          unlockedAt: unlockedByBadgeId.get(item.id)?.toISOString() ?? null,
          eventSlug: event?.slug ?? null,
          eventName: event?.name ?? null,
          eventStage: event ? lifecycleStageFor(event) : null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
