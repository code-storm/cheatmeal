export interface SkinCssVars {
  accent: string;
  aurora: [string, string, string];
}

/**
 * Reads a skin's CSS custom-property values for an ARBITRARY slug, not
 * necessarily the one currently applied to the app. Since skins are plain
 * CSS variable overrides on body[data-theme="..."], the only way to read
 * "what would slug X's colors be" is to briefly apply that attribute,
 * read the resulting computed values, then restore whatever theme was
 * actually active - all synchronously, before any repaint, so there's no
 * visible flicker. This keeps colors single-sourced from index.css rather
 * than duplicating them into a parallel TS color map that could drift.
 */
export function readSkinCssVars(slug: string): SkinCssVars {
  const body = document.body;
  const previousTheme = body.dataset.theme;

  body.dataset.theme = slug;
  const style = getComputedStyle(body);
  const result: SkinCssVars = {
    accent: style.getPropertyValue("--accent").trim(),
    aurora: [
      style.getPropertyValue("--aurora-stop-1").trim(),
      style.getPropertyValue("--aurora-stop-2").trim(),
      style.getPropertyValue("--aurora-stop-3").trim(),
    ],
  };

  if (previousTheme === undefined) {
    delete body.dataset.theme;
  } else {
    body.dataset.theme = previousTheme;
  }

  return result;
}
