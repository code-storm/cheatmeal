import type { Prisma, Event } from "@prisma/client";
import { events as eventContent } from "../content/events";

// Pure, stateless lifecycle derivation - mirrors featuredSkin.service.ts's
// style exactly: a function of (now, the event's own dates), recomputed
// fresh on every call rather than stored, so there is no persisted status
// field that could ever drift out of sync with startsAt/endsAt.

export type EventLifecycleStage = "UPCOMING" | "ACTIVE" | "ENDING_SOON" | "RETIRED";

const ENDING_SOON_WINDOW_MS = 48 * 60 * 60 * 1000;

export function lifecycleStageFor(
  event: { startsAt: Date; endsAt: Date; isActive: boolean },
  now: Date = new Date()
): EventLifecycleStage {
  if (!event.isActive) return "RETIRED";
  if (now < event.startsAt) return "UPCOMING";
  if (now > event.endsAt) return "RETIRED";
  if (event.endsAt.getTime() - now.getTime() <= ENDING_SOON_WINDOW_MS) return "ENDING_SOON";
  return "ACTIVE";
}

export function isEventNewlyPurchasable(stage: EventLifecycleStage): boolean {
  return stage === "ACTIVE" || stage === "ENDING_SOON";
}

export interface ResolvedEventTier {
  tier: number;
  pointsRequired: number;
  rewardItemSlug: string;
}

/**
 * Two-branch tier-ladder lookup, never a merge: the originally-seeded
 * event (cheatmeal-x-tokidoki) has its tiers hardcoded in
 * content/events.ts and keeps reading from there forever, unconditionally
 * - any admin-created event has no entry in that static array at all, so
 * it falls back to the persisted EventTier table instead. A given event's
 * tiers always come from exactly one of the two sources, so there's never
 * ambiguity about which pointsRequired value wins for a given tier
 * number. (If an admin ever added EventTier rows for cheatmeal-x-tokidoki
 * itself, they would simply never be read - the static entry always wins
 * once one exists for that slug.)
 *
 * Accepts either the top-level `prisma` client or an open transaction's
 * `tx` - callers inside a transaction (points.service.ts) pass `tx` so
 * this read participates in that transaction's snapshot; the read-only
 * progress route (events.routes.ts) passes the top-level client since
 * it's never inside a transaction there.
 */
export async function resolveEventTiers(
  db: Pick<Prisma.TransactionClient, "eventTier">,
  event: Pick<Event, "id" | "slug">
): Promise<ResolvedEventTier[]> {
  const content = eventContent.find((e) => e.slug === event.slug);
  if (content) {
    return content.tiers.map((t) => ({
      tier: t.tier,
      pointsRequired: t.pointsRequired,
      rewardItemSlug: t.rewardItemSlug,
    }));
  }

  const rows = await db.eventTier.findMany({
    where: { eventId: event.id },
    include: { rewardItem: true },
    orderBy: { tier: "asc" },
  });
  return rows.map((row) => ({
    tier: row.tier,
    pointsRequired: row.pointsRequired,
    rewardItemSlug: row.rewardItem.slug,
  }));
}
