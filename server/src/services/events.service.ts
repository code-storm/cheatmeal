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
