import confetti from "canvas-confetti";

/**
 * Fires a brief celebratory confetti burst in the given colors (sourced at
 * the call site from the unlocked skin's own CSS token values, not
 * hardcoded here - see readSkinCssVars). Respects prefers-reduced-motion
 * via canvas-confetti's own built-in check.
 */
export function fireUnlockConfetti(colors: string[]): void {
  confetti({
    particleCount: 140,
    spread: 80,
    origin: { y: 0.3 },
    colors,
    disableForReducedMotion: true,
  });
}
