import type { Event } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth";
import { checkAndAwardBadges } from "../services/badges.service";
import { effectiveCostFor, getFeaturedSkinSlug } from "../services/featuredSkin.service";
import { computeCurrentWeek } from "../services/pregnancyWeek.service";
import { lifecycleStageFor, isEventNewlyPurchasable } from "../services/events.service";
import { getActiveRewardItems } from "../lib/staticContentCache";
import { getEvents } from "../lib/eventCache";

const router = Router();

// Pregnancy-week-scoped scarcity: purchasability is compared against each
// user's OWN current week, not wall-clock time, so a window like
// weeks 28-40 means "your own third trimester," not a shared calendar date.
// Ownership (UserReward) never expires once granted - only this gate on
// NEW purchases does.
function isPurchasableForWeek(
  item: { isActive: boolean; availableFromWeek: number | null; availableUntilWeek: number | null },
  userWeek: number
): boolean {
  if (!item.isActive) return false;
  if (item.availableFromWeek != null && userWeek < item.availableFromWeek) return false;
  if (item.availableUntilWeek != null && userWeek > item.availableUntilWeek) return false;
  return true;
}

// Crossover-event scarcity: a shared, wall-clock-based gate, independent
// of the pregnancy-week gate above. An item with no eventId always passes
// this check; an item WITH one is only newly-purchasable while that event
// is ACTIVE or ENDING_SOON. Ownership, once granted, is unaffected -
// mirrors isPurchasableForWeek's "ownership never expires" rule verbatim.
function isPurchasableForEvent(item: { eventId: string | null }, eventsById: Map<string, Event>): boolean {
  if (!item.eventId) return true;
  const event = eventsById.get(item.eventId);
  if (!event) return false; // orphaned eventId - fail closed
  return isEventNewlyPurchasable(lifecycleStageFor(event));
}

function eventFieldsFor(item: { eventId: string | null }, eventsById: Map<string, Event>) {
  if (!item.eventId) return { eventSlug: null, eventName: null, eventStage: null };
  const event = eventsById.get(item.eventId);
  if (!event) return { eventSlug: null, eventName: null, eventStage: null };
  return { eventSlug: event.slug, eventName: event.name, eventStage: lifecycleStageFor(event) };
}

router.get("/rewards", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;

    const [profile, items, userRewards, featuredSlug, events] = await Promise.all([
      prisma.pregnancyProfile.findUnique({ where: { userId } }),
      getActiveRewardItems(),
      prisma.userReward.findMany({ where: { userId }, select: { rewardItemId: true } }),
      getFeaturedSkinSlug(),
      getEvents(),
    ]);

    if (!profile) {
      res.status(400).json({ error: "Profile required" });
      return;
    }

    const unlockedIds = new Set(userRewards.map((r) => r.rewardItemId));
    const userWeek = computeCurrentWeek(profile.lmpDate, new Date());
    const eventsById = new Map(events.map((e) => [e.id, e]));

    res.json({
      pointsBalance: profile.pointsBalance,
      totalPointsEarned: profile.totalPointsEarned,
      activeSkinSlug: profile.activeSkinSlug,
      activeAvatarSlug: profile.activeAvatarSlug,
      items: items.map((item) => {
        const featured = item.category === "SKIN" && item.slug === featuredSlug;
        return {
          slug: item.slug,
          name: item.name,
          description: item.description,
          category: item.category,
          rarity: item.rarity,
          costPoints: item.costPoints,
          effectiveCostPoints: effectiveCostFor(item.costPoints, featured),
          featured,
          icon: item.icon,
          imageUrl: item.imageUrl,
          powerKey: item.powerKey,
          unlocked: unlockedIds.has(item.id),
          purchasable: isPurchasableForWeek(item, userWeek) && isPurchasableForEvent(item, eventsById),
          availableFromWeek: item.availableFromWeek,
          availableUntilWeek: item.availableUntilWeek,
          ...eventFieldsFor(item, eventsById),
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/rewards/:slug/unlock", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { slug } = req.params;

    // profile has no data dependency on the item lookup - fetched together
    // instead of sequentially.
    const [activeItems, profile, events] = await Promise.all([
      getActiveRewardItems(),
      prisma.pregnancyProfile.findUnique({ where: { userId } }),
      getEvents(),
    ]);

    const item = activeItems.find((i) => i.slug === slug);
    if (!item) {
      res.status(404).json({ error: "Reward not found." });
      return;
    }
    if (!profile) {
      res.status(400).json({ error: "Profile required" });
      return;
    }

    const [existing, featuredSlug] = await Promise.all([
      prisma.userReward.findUnique({
        where: { userId_rewardItemId: { userId, rewardItemId: item.id } },
      }),
      getFeaturedSkinSlug(),
    ]);
    if (existing) {
      res.status(409).json({ error: "Already unlocked." });
      return;
    }

    const userWeek = computeCurrentWeek(profile.lmpDate, new Date());
    if (!isPurchasableForWeek(item, userWeek)) {
      res.status(403).json({ error: "This reward is not available for your current pregnancy week." });
      return;
    }

    const eventsById = new Map(events.map((e) => [e.id, e]));
    if (!isPurchasableForEvent(item, eventsById)) {
      res.status(403).json({ error: "This item's event is no longer available." });
      return;
    }

    const isFeatured = item.category === "SKIN" && item.slug === featuredSlug;
    const effectiveCost = effectiveCostFor(item.costPoints, isFeatured);

    if (profile.pointsBalance < effectiveCost) {
      res.status(400).json({ error: "Not enough points." });
      return;
    }

    const { pointsBalance, newBadges } = await prisma.$transaction(async (tx) => {
      await tx.userReward.create({
        data: { userId, rewardItemId: item.id },
      });
      const updatedProfile = await tx.pregnancyProfile.update({
        where: { userId },
        data: { pointsBalance: { decrement: effectiveCost } },
      });
      const newBadges = await checkAndAwardBadges(tx, userId);
      return { pointsBalance: updatedProfile.pointsBalance, newBadges };
    }, { timeout: 15000 });

    res.json({
      pointsBalance,
      item: {
        ...item,
        effectiveCostPoints: effectiveCost,
        featured: isFeatured,
        unlocked: true,
        purchasable: true,
        ...eventFieldsFor(item, eventsById),
      },
      newBadges,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/rewards/deactivate", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { category } = req.body as { category?: unknown };

    if (category !== "SKIN" && category !== "AVATAR") {
      res.status(400).json({ error: "category must be SKIN or AVATAR." });
      return;
    }

    const profile = await prisma.pregnancyProfile.update({
      where: { userId },
      data: category === "SKIN" ? { activeSkinSlug: "default" } : { activeAvatarSlug: null },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

router.post("/rewards/:slug/activate", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId as string;
    const { slug } = req.params;

    const item = await prisma.rewardItem.findUnique({ where: { slug } });
    if (!item || !item.isActive) {
      res.status(404).json({ error: "Reward not found." });
      return;
    }
    if (item.category !== "SKIN" && item.category !== "AVATAR") {
      res.status(400).json({ error: "Only skins and avatars can be activated." });
      return;
    }

    const unlocked = await prisma.userReward.findUnique({
      where: { userId_rewardItemId: { userId, rewardItemId: item.id } },
    });
    if (!unlocked) {
      res.status(403).json({ error: "Unlock this reward before activating it." });
      return;
    }

    const profile = await prisma.pregnancyProfile.update({
      where: { userId },
      data:
        item.category === "SKIN"
          ? { activeSkinSlug: item.slug }
          : { activeAvatarSlug: item.slug },
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

export default router;
