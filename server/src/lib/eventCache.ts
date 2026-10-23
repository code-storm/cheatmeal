import type { Event } from "@prisma/client";
import { prisma } from "./prisma";

// A short-TTL sibling to staticContentCache.ts, deliberately NOT folded
// into warmStaticContentCache()'s eternal-Promise pattern: Event rows are
// expected to change at runtime without a restart (a new event seeded, an
// isActive kill-switch flipped), unlike every table that cache covers. A
// 60s TTL is long enough to absorb request bursts but short enough that a
// manual change is visible within a minute with no redeploy.
//
// Still warmed once at boot (see index.ts) - not to make it eternal, only
// to guarantee it's never COLD on its first touch from inside an open
// $transaction (awardPoints's event-progress crediting does exactly
// this), which is the exact shape that caused this app's prior real
// deadlock (see staticContentCache.ts's comment for the full story).
const EVENT_CACHE_TTL_MS = 60_000;

let cachedAt = 0;
let cached: Promise<Event[]> | null = null;

export function getEvents(): Promise<Event[]> {
  if (!cached || Date.now() - cachedAt > EVENT_CACHE_TTL_MS) {
    cached = prisma.event.findMany();
    cachedAt = Date.now();
  }
  return cached;
}

export function invalidateEventCache(): void {
  cached = null;
}
