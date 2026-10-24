// Shared Framer Motion spring/transition configs, so every glass panel and
// interactive control in the app moves the same way (Liquid Glass brief:
// hover = slight elevation, tap = 97-98% compress + spring snap-back,
// page transitions = fade+scale, 250-400ms).

export const SPRING_HOVER = { type: "spring", stiffness: 320, damping: 24 } as const;
export const SPRING_TAP = { type: "spring", stiffness: 500, damping: 28 } as const;
export const PAGE_TRANSITION = { duration: 0.32, ease: [0.4, 0, 0.2, 1] } as const;

export const TAP_SCALE = { scale: 0.97 } as const;
export const HOVER_LIFT = { y: -2 } as const;

// Deliberately its OWN (shorter) duration, not PAGE_TRANSITION - this is
// consumed only by AppLayout's route-level crossfade, under
// AnimatePresence mode="wait". "wait" holds the incoming page unmounted
// until the outgoing one's exit finishes, which is what keeps the two
// pages from visibly overlapping (the jerky "new content appears before
// old content is gone" look that mode="popLayout"/"sync" produce, since
// those animate both simultaneously) - but it also means this duration
// is pure dead time on EVERY navigation, twice over (exit then enter), so
// it needs to be short. At 0.32s (PAGE_TRANSITION's value, shared with
// several non-sequenced UI moments like cards/dialogs where a longer feel
// is fine) this was ~640ms of unconditional lag per route change, even
// when the new page's data was already cached and ready to paint
// instantly - the original complaint. 0.14s keeps the clean, no-overlap
// sequencing while cutting that to ~280ms total.
const ROUTE_TRANSITION = { duration: 0.14, ease: [0.4, 0, 0.2, 1] } as const;

export const PAGE_FADE_SCALE = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: ROUTE_TRANSITION,
} as const;
