import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { requireAdminAuth } from "../../middleware/requireAdminAuth";
import { invalidateActiveBadgesCache } from "../../lib/staticContentCache";
import { invalidateEventCache } from "../../lib/eventCache";
import { isBadgeCriteriaKey, BADGE_CRITERIA_KEYS } from "../../services/badges.service";

const router = Router();

router.use(requireAdminAuth);

function parseBadgeBody(body: unknown): {
  errors: string[];
  data: {
    slug?: string;
    name?: string;
    description?: string;
    icon?: string;
    criteriaKey?: string;
    imageUrl?: string | null;
    eventId?: string | null;
    isActive?: boolean;
  };
} {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;
  const data: ReturnType<typeof parseBadgeBody>["data"] = {};

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
  if (b.icon !== undefined) {
    if (typeof b.icon !== "string" || b.icon.trim().length === 0) errors.push("icon must be a non-empty string.");
    else data.icon = b.icon.trim();
  }
  if (b.criteriaKey !== undefined) {
    if (!isBadgeCriteriaKey(b.criteriaKey)) {
      errors.push(`criteriaKey must be one of: ${BADGE_CRITERIA_KEYS.join(", ")}.`);
    } else {
      data.criteriaKey = b.criteriaKey;
    }
  }
  if (b.imageUrl !== undefined) {
    data.imageUrl = b.imageUrl === null ? null : typeof b.imageUrl === "string" ? b.imageUrl : "";
  }
  if (b.eventId !== undefined) {
    data.eventId = b.eventId === null ? null : typeof b.eventId === "string" ? b.eventId : "";
    if (data.eventId === "" && b.eventId !== null) errors.push("eventId must be a string or null.");
  }
  if (b.isActive !== undefined) {
    if (typeof b.isActive !== "boolean") errors.push("isActive must be a boolean.");
    else data.isActive = b.isActive;
  }

  // EVENT_FIRST_ITEM/EVENT_SET_COMPLETE use the badge's own eventId as
  // their implicit parameter (see badges.service.ts) - without one,
  // isCriteriaMet's branch for either key returns false unconditionally,
  // so a badge like that would also be permanently un-awardable.
  if (
    (data.criteriaKey === "EVENT_FIRST_ITEM" || data.criteriaKey === "EVENT_SET_COMPLETE") &&
    data.eventId === null
  ) {
    errors.push("eventId is required when criteriaKey is EVENT_FIRST_ITEM or EVENT_SET_COMPLETE.");
  }

  return { errors, data };
}

router.get("/badges", async (_req, res, next) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { slug: "asc" },
      include: { event: { select: { slug: true, name: true } } },
    });
    res.json({
      badges: badges.map((bdg) => ({
        id: bdg.id,
        slug: bdg.slug,
        name: bdg.name,
        description: bdg.description,
        icon: bdg.icon,
        criteriaKey: bdg.criteriaKey,
        isActive: bdg.isActive,
        imageUrl: bdg.imageUrl,
        eventId: bdg.eventId,
        eventSlug: bdg.event?.slug ?? null,
        eventName: bdg.event?.name ?? null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/badges/:id", async (req, res, next) => {
  try {
    const badge = await prisma.badge.findUnique({ where: { id: req.params.id } });
    if (!badge) {
      res.status(404).json({ error: "Badge not found." });
      return;
    }
    res.json({ badge });
  } catch (err) {
    next(err);
  }
});

router.post("/badges", async (req, res, next) => {
  try {
    const { errors, data } = parseBadgeBody(req.body);
    const required: Array<keyof typeof data> = ["slug", "name", "description", "icon", "criteriaKey"];
    for (const field of required) {
      if (data[field] === undefined) errors.push(`${field} is required.`);
    }
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const badge = await prisma.badge.create({
      data: {
        slug: data.slug!,
        name: data.name!,
        description: data.description!,
        icon: data.icon!,
        criteriaKey: data.criteriaKey!,
        imageUrl: data.imageUrl ?? null,
        eventId: data.eventId ?? null,
        isActive: data.isActive ?? true,
      },
    });

    invalidateActiveBadgesCache();
    invalidateEventCache();

    res.status(201).json({ badge: { id: badge.id, slug: badge.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "A badge with this slug already exists." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      res.status(400).json({ error: "eventId does not refer to an existing Event." });
      return;
    }
    next(err);
  }
});

router.patch("/badges/:id", async (req, res, next) => {
  try {
    const { errors, data } = parseBadgeBody(req.body);
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const badge = await prisma.badge.update({
      where: { id: req.params.id },
      data,
    });

    invalidateActiveBadgesCache();
    invalidateEventCache();

    res.json({ badge: { id: badge.id, slug: badge.slug } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "A badge with this slug already exists." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      res.status(400).json({ error: "eventId does not refer to an existing Event." });
      return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Badge not found." });
      return;
    }
    next(err);
  }
});

// No DELETE route - soft-delete only, via PATCH { isActive: false }, same
// rationale as adminRewards.routes.ts (Badge is FK-referenced by
// UserBadge).

export default router;
