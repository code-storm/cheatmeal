import { readSkinCssVars } from "../utils/skinColors";
import type { SkinCssVars } from "../utils/skinColors";

interface SkinSwatchProps {
  slug: string;
  icon: string;
}

// Module-level (not per-component-instance) cache: a skin's CSS vars are
// static for the lifetime of the page (they come from index.css, never
// change at runtime), so once any SkinSwatch anywhere has read a given
// slug, every other instance - and every future remount - can reuse that
// result instead of paying for another readSkinCssVars() call. This
// matters because that call does a real forced style recalc
// (getComputedStyle after a body.dataset.theme write): with ~15 SKIN
// cards on the Rewards/Wardrobe page, a naive per-instance useMemo (the
// previous approach) still re-paid that cost on every single mount of
// every card (e.g. every time the grid re-renders from scratch), which
// is a real, measurable source of UI-feels-slow-after-the-API-returned
// jank. A plain module object is fine here (not a hook) - this is pure
// derived data with no component lifecycle tie, same rationale as a
// memoized pure function.
const skinCssVarsCache = new Map<string, SkinCssVars>();

function cachedSkinCssVars(slug: string): SkinCssVars {
  let cached = skinCssVarsCache.get(slug);
  if (!cached) {
    cached = readSkinCssVars(slug);
    skinCssVarsCache.set(slug, cached);
  }
  return cached;
}

/**
 * A small glass-panel thumbnail of a skin's look, shown on every SKIN
 * reward card regardless of lock state - unlike the app-wide live Preview
 * (RewardPreviewContext), this never touches document.body.dataset.theme
 * for longer than the single synchronous read in readSkinCssVars (and
 * only once per slug ever, see skinCssVarsCache above), so it carries no
 * risk of leaking a theme change anywhere.
 *
 * Built from the accent + aurora stops together: the aurora tokens alone
 * are deliberately faint background colors (meant to fade to transparent
 * behind frosted glass), so sampled as a flat opaque swatch they read as a
 * muddy, indistinct box. Blending in the accent (real saturation) gives
 * each skin a swatch that actually looks distinct, and the skin's own icon
 * sits on top in a frosted glass chip - a miniature of this app's own
 * glass-panel language, not a stray color bar.
 */
export function SkinSwatch({ slug, icon }: SkinSwatchProps) {
  const { accent, aurora } = cachedSkinCssVars(slug);

  return (
    <div
      className="skin-swatch"
      style={{ background: `linear-gradient(135deg, ${aurora[0]} 0%, ${accent} 55%, ${aurora[2]} 100%)` }}
      aria-hidden="true"
    >
      <span className="skin-swatch__icon">{icon}</span>
    </div>
  );
}
