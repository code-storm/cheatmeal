import { useEffect } from "react";

/**
 * Drives the --pointer-x/--pointer-y custom properties consumed by the
 * .glass-glow CSS utility, so hovered glass panels show a specular
 * highlight that tracks the cursor. A single document-level listener
 * (not per-panel) keeps this cheap: one rAF-throttled pointermove updates
 * two vars on the root element, read by every .glass-glow::before.
 *
 * Gated off entirely (listener never attached) on touch devices and under
 * prefers-reduced-motion - the CSS .glass-glow rules have their own
 * media-query fallback too, so this is belt-and-suspenders, not the only
 * guard.
 */
export function usePointerGlow(): void {
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let raf = 0;

    function onPointerMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const xPct = (e.clientX / window.innerWidth) * 100;
        const yPct = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty("--pointer-x", `${xPct}%`);
        document.documentElement.style.setProperty("--pointer-y", `${yPct}%`);
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
