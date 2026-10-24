import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/requireAdminAuth";
import { invalidateEventCache } from "../../lib/eventCache";
import { lifecycleStageFor } from "../../services/events.service";

const router = Router();

router.use(requireAdminAuth);

function parseEventBody(body: unknown): {
  errors: string[];
  data: {
    slug?: string;
    name?: string;
    tagline?: string;
    description?: string;
    sponsorName?: string | null;
    themeSlug?: string;
    heroImageUrl?: string | null;
    cardImageUrl?: string | null;
    startsAt?: Date;
    endsAt?: Date;
    isActive?: boolean;
  };
} {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;
  const data: ReturnType<typeof parseEventBody>["data"] = {};

  if (b.slug !== undefined) {
    if (typeof b.slug !== "string" || b.slug.trim().length === 0) errors.push("slug must be a non-empty string.");
    else data.slug = b.slug.trim();
  }
  if (b.name !== undefined) {
    if (typeof b.name !== "string" || b.name.trim().length === 0) errors.push("name must be a non-empty string.");
    else data.name = b.name.trim();
  }
  if (b.tagline !== undefined) {
    if (typeof b.tagline !== "string" || b.tagline.trim().length === 0)
      errors.push("tagline must be a non-empty string.");
    else data.tagline = b.tagline.trim();
  }
  if (b.description !== undefined) {
    if (typeof b.description !== "string" || b.description.trim().length === 0)
      errors.push("description must be a non-empty string.");
    else data.description = b.description.trim();
  }
  if (b.sponsorName !== undefined) {
    data.sponsorName = b.sponsorName === null ? null : typeof b.sponsorName === "string" ? b.sponsorName.trim() : "";
    if (data.sponsorName === "" && b.sponsorName !== null) errors.push("sponsorName must be a string or null.");
  }
  if (b.themeSlug !== undefined) {
    if (typeof b.themeSlug !== "string" || b.themeSlug.trim().length === 0)
      errors.push("themeSlug must be a non-empty string.");
    else data.themeSlug = b.themeSlug.trim();
  }
  if (b.heroImageUrl !== undefined) {
    data.heroImageUrl = b.heroImageUrl === null ? null : typeof b.heroImageUrl === "string" ? b.heroImageUrl : "";
  }
  if (b.cardImageUrl !== undefined) {
    data.cardImageUrl = b.cardImageUrl === null ? null : typeof b.cardImageUrl === "string" ? b.cardImageUrl : "";
  }
  if (b.startsAt !== undefined) {
    const d = new Date(b.startsAt as string);
    if (Number.isNaN(d.getTime())) errors.push("startsAt must be a valid ISO date string.");
    else data.startsAt = d;
  }
  if (b.endsAt !== undefined) {
    const d = new Date(b.endsAt as string);
    if (Number.isNaN(d.getTime())) errors.push("endsAt must be a valid ISO date string.");
    else data.endsAt = d;
  }
  if (b.isActive !== undefined) {
    if (typeof b.isActive !== "boolean") errors.push("isActive must be a boolean.");
    else data.isActive = b.isActive;
  }
  if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
    errors.push("startsAt must be before endsAt.");
  }

  return { errors, data };
}

router.get("/events", async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { eventTiers: { include: { rewardItem: true }, orderBy: { tier: "asc" } } },
    });
    const now = new Date();
    res.json({
      events: events.map((e) => ({
        id: e.id,
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
        isActive: e.isActive,
        stage: lifecycleStageFor(e, now),
        tiers: e.eventTiers.map((t) => ({
          id: t.id,
          tier: t.tier,
          pointsRequired: t.pointsRequired,
          rewardItemId: t.rewardItemId,
          rewardItemSlug: t.rewardItem.slug,
          rewardItemName: t.rewardItem.name,
        })),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/events/:id", async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { eventTiers: { include: { rewardItem: true }, orderBy: { tier: "asc" } } },
    });
    if (!event) {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    res.json({
      event: {
        id: event.id,
        slug: event.slug,
        name: event.name,
        tagline: event.tagline,
        description: event.description,
        sponsorName: event.sponsorName,
        themeSlug: event.themeSlug,
        heroImageUrl: event.heroImageUrl,
        cardImageUrl: event.cardImageUrl,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt.toISOString(),
        isActive: event.isActive,
        stage: lifecycleStageFor(event),
        tiers: event.eventTiers.map((t) => ({
          id: t.id,
          tier: t.tier,
          pointsRequired: t.pointsRequired,
          rewardItemId: t.rewardItemId,
          rewardItemSlug: t.rewardItem.slug,
          rewardItemName: t.rewardItem.name,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/events", async (req, res, next) => {
  try {
    const { errors, data } = parseEventBody(req.body);
    const required: Array<keyof typeof data> = ["slug", "name", "tagline", "description", "themeSlug", "startsAt", "endsAt"];
    for (const field of required) {
      if (data[field] === undefined) errors.push(`${field} is required.`);
    }
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const event = await prisma.event.create({
      data: {
        slug: data.slug!,
        name: data.name!,
        tagline: data.tagline!,
        description: data.description!,
        sponsorName: data.sponsorName ?? null,
        themeSlug: data.themeSlug!,
        heroImageUrl: data.heroImageUrl ?? null,
        cardImageUrl: data.cardImageUrl ?? null,
        startsAt: data.startsAt!,
        endsAt: data.endsAt!,
        isActive: data.isActive ?? true,
      },
    });

    invalidateEventCache();

    res.status(201).json({ event: { id: event.id, slug: event.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "An event with this slug already exists." });
      return;
    }
    next(err);
  }
});

router.patch("/events/:id", async (req, res, next) => {
  try {
    const { errors, data } = parseEventBody(req.body);
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });

    invalidateEventCache();

    res.json({ event: { id: event.id, slug: event.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "An event with this slug already exists." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    next(err);
  }
});

router.post("/events/:id/tiers", async (req, res, next) => {
  try {
    const { tier, pointsRequired, rewardItemId } = req.body as {
      tier?: unknown;
      pointsRequired?: unknown;
      rewardItemId?: unknown;
    };

    if (typeof tier !== "number" || !Number.isInteger(tier) || tier < 1) {
      res.status(400).json({ error: "tier must be a positive integer." });
      return;
    }
    if (typeof pointsRequired !== "number" || !Number.isInteger(pointsRequired) || pointsRequired < 0) {
      res.status(400).json({ error: "pointsRequired must be a non-negative integer." });
      return;
    }
    if (typeof rewardItemId !== "string" || rewardItemId.length === 0) {
      res.status(400).json({ error: "rewardItemId is required." });
      return;
    }

    const rewardItem = await prisma.rewardItem.findUnique({ where: { id: rewardItemId } });
    if (!rewardItem) {
      res.status(400).json({ error: "rewardItemId does not refer to an existing RewardItem." });
      return;
    }

    const existingTier = await prisma.eventTier.findUnique({
      where: { eventId_tier: { eventId: req.params.id, tier } },
    });
    if (existingTier) {
      res.status(409).json({ error: `Tier ${tier} already exists for this event.` });
      return;
    }

    const created = await prisma.eventTier.create({
      data: { eventId: req.params.id, tier, pointsRequired, rewardItemId },
    });

    res.status(201).json({ tier: { id: created.id, tier: created.tier, pointsRequired: created.pointsRequired, rewardItemId: created.rewardItemId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2003" || err.code === "P2025")) {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    next(err);
  }
});

router.patch("/events/:id/tiers/:tierId", async (req, res, next) => {
  try {
    const { pointsRequired, rewardItemId } = req.body as { pointsRequired?: unknown; rewardItemId?: unknown };
    const data: { pointsRequired?: number; rewardItemId?: string } = {};

    if (pointsRequired !== undefined) {
      if (typeof pointsRequired !== "number" || !Number.isInteger(pointsRequired) || pointsRequired < 0) {
        res.status(400).json({ error: "pointsRequired must be a non-negative integer." });
        return;
      }
      data.pointsRequired = pointsRequired;
    }
    if (rewardItemId !== undefined) {
      if (typeof rewardItemId !== "string" || rewardItemId.length === 0) {
        res.status(400).json({ error: "rewardItemId must be a non-empty string." });
        return;
      }
      const rewardItem = await prisma.rewardItem.findUnique({ where: { id: rewardItemId } });
      if (!rewardItem) {
        res.status(400).json({ error: "rewardItemId does not refer to an existing RewardItem." });
        return;
      }
      data.rewardItemId = rewardItemId;
    }

    const updated = await prisma.eventTier.update({
      where: { id: req.params.tierId },
      data,
    });

    res.json({ tier: { id: updated.id, tier: updated.tier, pointsRequired: updated.pointsRequired, rewardItemId: updated.rewardItemId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Tier not found." });
      return;
    }
    next(err);
  }
});

// Hard-delete is acceptable here specifically, unlike Event/RewardItem/
// Badge themselves - an EventTier row is pure configuration (a threshold
// + a pointer to a reward) with nothing else FK'd to its own id. A user
// who already claimed this tier keeps their claimedTiers entry and
// granted UserReward; deleting the row only stops future crediting at
// this threshold.
router.delete("/events/:id/tiers/:tierId", async (req, res, next) => {
  try {
    await prisma.eventTier.delete({ where: { id: req.params.tierId } });
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Tier not found." });
      return;
    }
    next(err);
  }
});

export default router;
