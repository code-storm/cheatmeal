import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { getEvents } from "../lib/eventCache";
import { lifecycleStageFor, resolveEventTiers } from "../services/events.service";

const router = Router();

router.get("/events", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const events = await getEvents();
    const now = new Date();

    res.json({
      events: events
        .map((e) => ({
          slug: e.slug,
          name: e.name,
          tagline: e.tagline,
          description: e.description,
          sponsorName: e.sponsorName,
          themeSlug: e.themeSlug,
          heroImageUrl: e.heroImageUrl,
          cardImageUrl: e.cardImageUrl,
          startsAt: e.startsAt.toISOString(),
          endsAt: e.endsAt.toISOString(),
          stage: lifecycleStageFor(e, now),
        }))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/events/:slug/progress", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { slug } = req.params;

    const events = await getEvents();
    const event = events.find((e) => e.slug === slug);
    if (!event) {
      res.status(404).json({ error: "Event not found." });
      return;
    }

    const tiers = await resolveEventTiers(prisma, event);

    const progress = await prisma.eventProgress.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
    });

    const pointsEarnedDuringEvent = progress?.pointsEarnedDuringEvent ?? 0;
    const claimedTiers = new Set(
      (progress?.claimedTiers ?? "")
        .split(",")
        .filter(Boolean)
        .map((t) => Number(t))
    );

    res.json({
      eventSlug: slug,
      pointsEarnedDuringEvent,
      stage: lifecycleStageFor(event),
      tiers: tiers.map((tier) => ({
        tier: tier.tier,
        pointsRequired: tier.pointsRequired,
        rewardItemSlug: tier.rewardItemSlug,
        claimed: claimedTiers.has(tier.tier),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
