import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/requireAdminAuth";
import { invalidateActiveRewardItemsCache } from "../../lib/staticContentCache";
import { invalidateEventCache } from "../../lib/eventCache";
import { isRewardCategory, isRarity, isPowerKey } from "../../lib/enums";

const router = Router();

router.use(requireAdminAuth);

function parseRewardBody(body: unknown): {
  errors: string[];
  data: {
    slug?: string;
    name?: string;
    description?: string;
    category?: string;
    rarity?: string;
    costPoints?: number;
    icon?: string;
    powerKey?: string | null;
    imageUrl?: string | null;
    availableFromWeek?: number | null;
    availableUntilWeek?: number | null;
    eventId?: string | null;
    isActive?: boolean;
  };
} {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;
  const data: ReturnType<typeof parseRewardBody>["data"] = {};

  if (b.slug !== undefined) {
    if (typeof b.slug !== "string" || b.slug.trim().length === 0) errors.push("slug must be a non-empty string.");
    else data.slug = b.slug.trim();
  }
  if (b.name !== undefined) {
    if (typeof b.name !== "string" || b.name.trim().length === 0) errors.push("name must be a non-empty string.");
    else data.name = b.name.trim();
  }
  if (b.description !== undefined) {
    if (typeof b.description !== "string" || b.description.trim().length === 0)
      errors.push("description must be a non-empty string.");
    else data.description = b.description.trim();
  }
  if (b.category !== undefined) {
    if (!isRewardCategory(b.category)) errors.push("category must be one of SKIN, AVATAR, POWER.");
    else data.category = b.category;
  }
  if (b.rarity !== undefined) {
    if (!isRarity(b.rarity)) errors.push("rarity must be one of COMMON, RARE, EPIC, LEGENDARY.");
    else data.rarity = b.rarity;
  }
  if (b.costPoints !== undefined) {
    if (typeof b.costPoints !== "number" || !Number.isInteger(b.costPoints) || b.costPoints < 0)
      errors.push("costPoints must be a non-negative integer.");
    else data.costPoints = b.costPoints;
  }
  if (b.icon !== undefined) {
    if (typeof b.icon !== "string" || b.icon.trim().length === 0) errors.push("icon must be a non-empty string.");
    else data.icon = b.icon.trim();
  }
  if (b.powerKey !== undefined) {
    if (b.powerKey === null) data.powerKey = null;
    else if (!isPowerKey(b.powerKey)) errors.push("powerKey must be one of TOMORROW_PREVIEW, FRESH_PICK, or null.");
    else data.powerKey = b.powerKey;
  }
  if (b.imageUrl !== undefined) {
    data.imageUrl = b.imageUrl === null ? null : typeof b.imageUrl === "string" ? b.imageUrl : "";
  }
  if (b.availableFromWeek !== undefined) {
    if (b.availableFromWeek === null) data.availableFromWeek = null;
    else if (typeof b.availableFromWeek !== "number") errors.push("availableFromWeek must be a number or null.");
    else data.availableFromWeek = b.availableFromWeek;
  }
  if (b.availableUntilWeek !== undefined) {
    if (b.availableUntilWeek === null) data.availableUntilWeek = null;
    else if (typeof b.availableUntilWeek !== "number") errors.push("availableUntilWeek must be a number or null.");
    else data.availableUntilWeek = b.availableUntilWeek;
  }
  if (b.eventId !== undefined) {
    data.eventId = b.eventId === null ? null : typeof b.eventId === "string" ? b.eventId : "";
    if (data.eventId === "" && b.eventId !== null) errors.push("eventId must be a string or null.");
  }
  if (b.isActive !== undefined) {
    if (typeof b.isActive !== "boolean") errors.push("isActive must be a boolean.");
    else data.isActive = b.isActive;
  }

  // category=POWER <-> powerKey presence, same invariant the seed content
  // already upholds by convention (content/rewards.ts never sets powerKey
  // outside a POWER item) - enforced here since this is the first runtime
  // write path for this table.
  const effectiveCategory = data.category;
  const effectivePowerKey = data.powerKey;
  if (effectiveCategory === "POWER" && effectivePowerKey === null) {
    errors.push("powerKey is required when category is POWER.");
  }
  if (effectiveCategory && effectiveCategory !== "POWER" && effectivePowerKey) {
    errors.push("powerKey may only be set when category is POWER.");
  }

  return { errors, data };
}

router.get("/rewards", async (_req, res, next) => {
  try {
    const items = await prisma.rewardItem.findMany({
      orderBy: { slug: "asc" },
      include: { event: { select: { slug: true, name: true } } },
    });
    res.json({
      items: items.map((i) => ({
        id: i.id,
        slug: i.slug,
        name: i.name,
        description: i.description,
        category: i.category,
        rarity: i.rarity,
        costPoints: i.costPoints,
        icon: i.icon,
        powerKey: i.powerKey,
        isActive: i.isActive,
        imageUrl: i.imageUrl,
        availableFromWeek: i.availableFromWeek,
        availableUntilWeek: i.availableUntilWeek,
        eventId: i.eventId,
        eventSlug: i.event?.slug ?? null,
        eventName: i.event?.name ?? null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/rewards/:id", async (req, res, next) => {
  try {
    const item = await prisma.rewardItem.findUnique({ where: { id: req.params.id } });
    if (!item) {
      res.status(404).json({ error: "Reward item not found." });
      return;
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

router.post("/rewards", async (req, res, next) => {
  try {
    const { errors, data } = parseRewardBody(req.body);
    const required: Array<keyof typeof data> = ["slug", "name", "description", "category", "costPoints", "icon"];
    for (const field of required) {
      if (data[field] === undefined) errors.push(`${field} is required.`);
    }
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const item = await prisma.rewardItem.create({
      data: {
        slug: data.slug!,
        name: data.name!,
        description: data.description!,
        category: data.category!,
        rarity: data.rarity ?? "COMMON",
        costPoints: data.costPoints!,
        icon: data.icon!,
        powerKey: data.powerKey ?? null,
        imageUrl: data.imageUrl ?? null,
        availableFromWeek: data.availableFromWeek ?? null,
        availableUntilWeek: data.availableUntilWeek ?? null,
        eventId: data.eventId ?? null,
        isActive: data.isActive ?? true,
      },
    });

    invalidateActiveRewardItemsCache();
    invalidateEventCache();

    res.status(201).json({ item: { id: item.id, slug: item.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "A reward item with this slug already exists." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      res.status(400).json({ error: "eventId does not refer to an existing Event." });
      return;
    }
    next(err);
  }
});

router.patch("/rewards/:id", async (req, res, next) => {
  try {
    const { errors, data } = parseRewardBody(req.body);
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const item = await prisma.rewardItem.update({
      where: { id: req.params.id },
      data,
    });

    invalidateActiveRewardItemsCache();
    invalidateEventCache();

    res.json({ item: { id: item.id, slug: item.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "A reward item with this slug already exists." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      res.status(400).json({ error: "eventId does not refer to an existing Event." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Reward item not found." });
      return;
    }
    next(err);
  }
});

// No DELETE route - soft-delete only, via PATCH { isActive: false }.
// RewardItem is FK-referenced by UserReward and EventTier, so a hard
// delete would either violate those constraints while references exist
// or silently orphan a real user's ownership history if cascade behavior
// were ever added later.

export default router;
