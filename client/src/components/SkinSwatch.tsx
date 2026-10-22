import { useMemo } from "react";
import { readSkinCssVars } from "../utils/skinColors";

interface SkinSwatchProps {
  slug: string;
  icon: string;
}

/**
 * A small glass-panel thumbnail of a skin's look, shown on every SKIN
 * reward card regardless of lock state - unlike the app-wide live Preview
 * (RewardPreviewContext), this never touches document.body.dataset.theme
 * for longer than the single synchronous read in readSkinCssVars, so it
 * carries no risk of leaking a theme change anywhere.
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
  const { accent, aurora } = useMemo(() => readSkinCssVars(slug), [slug]);

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
