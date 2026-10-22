import { useCallback, useEffect, useState } from "react";

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

export function useColorScheme(): {
  scheme: ColorScheme;
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
  toggle: () => void;
} {
  const [preference, setPreferenceState] = useState<ColorSchemePreference>(readStoredPreference);
  const [scheme, setScheme] = useState<ColorScheme>(() => resolveScheme(preference));

  useEffect(() => {
    document.documentElement.dataset.colorScheme = scheme;
  }, [scheme]);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setScheme(systemPrefersDark() ? "dark" : "light");
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ColorSchemePreference) => {
    setPreferenceState(next);
    setScheme(resolveScheme(next));
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setPreference(scheme === "dark" ? "light" : "dark");
  }, [scheme, setPreference]);

  return { scheme, preference, setPreference, toggle };
}
