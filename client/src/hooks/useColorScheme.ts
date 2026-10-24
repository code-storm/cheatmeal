import { useCallback, useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark";
export type ColorSchemePreference = ColorScheme | "system";

const STORAGE_KEY = "cheatmeal:color-scheme";

function readStoredPreference(): ColorSchemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveScheme(preference: ColorSchemePreference): ColorScheme {
  if (preference === "system") return systemPrefersDark() ? "dark" : "light";
  return preference;
}

// A genuine external store (DOM attribute + localStorage, not React state)
// rather than plain useState inside the hook: the previous version kept
// `scheme` local to whichever single component called useColorScheme()
// (only ever AppLayout), so no OTHER component - e.g. SkinSwatch, read via
// getComputedStyle from inside RewardsPage/WardrobePage's own subtree -
// had any way to learn the scheme had changed and re-render. Toggling
// color scheme updated the DOM attribute and CSS correctly, but anything
// that had cached a *computed value derived from* that attribute earlier
// in the session kept serving its stale read forever, since nothing ever
// prompted it to look again. useSyncExternalStore lets any component in
// the tree subscribe to this same module-level state, not just the one
// that happens to own the toggle button - confirmed necessary (not just
// the cache-key/sync-write fix already in SkinSwatch.tsx) to fix QA report
// 2026-10-25-rewards-countdown-skinswatch.md bug #1.
let preference: ColorSchemePreference = readStoredPreference();
let scheme: ColorScheme = resolveScheme(preference);
const listeners = new Set<() => void>();

function applyScheme(next: ColorScheme) {
  scheme = next;
  document.documentElement.dataset.colorScheme = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ColorScheme {
  return scheme;
}

// Keep "system" preference live against OS-level changes - registered once
// at module scope (not per-hook-call) since there's only ever one DOM/OS to
// listen to, regardless of how many components call useColorScheme().
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (preference === "system") applyScheme(systemPrefersDark() ? "dark" : "light");
});

// Apply once at module load, synchronously - before React even mounts -
// so the very first render already sees the right attribute/scheme, with
// no flash-of-wrong-theme useEffect needed.
document.documentElement.dataset.colorScheme = scheme;

function setPreference(next: ColorSchemePreference): void {
  preference = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyScheme(resolveScheme(next));
}

export function useColorScheme(): {
  scheme: ColorScheme;
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
  toggle: () => void;
} {
  const currentScheme = useSyncExternalStore(subscribe, getSnapshot);

  const toggle = useCallback(() => {
    setPreference(currentScheme === "dark" ? "light" : "dark");
  }, [currentScheme]);

  return { scheme: currentScheme, preference, setPreference, toggle };
}
