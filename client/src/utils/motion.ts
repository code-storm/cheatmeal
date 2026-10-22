// Shared Framer Motion spring/transition configs, so every glass panel and
// interactive control in the app moves the same way (Liquid Glass brief:
// hover = slight elevation, tap = 97-98% compress + spring snap-back,
// page transitions = fade+scale, 250-400ms).

export const SPRING_HOVER = { type: "spring", stiffness: 320, damping: 24 } as const;
export const SPRING_TAP = { type: "spring", stiffness: 500, damping: 28 } as const;
export const PAGE_TRANSITION = { duration: 0.32, ease: [0.4, 0, 0.2, 1] } as const;

export const TAP_SCALE = { scale: 0.97 } as const;
export const HOVER_LIFT = { y: -2 } as const;

export const PAGE_FADE_SCALE = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: PAGE_TRANSITION,
} as const;
