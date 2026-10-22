import { motion } from "framer-motion";
import type { ColorScheme } from "../hooks/useColorScheme";

interface ColorSchemeToggleProps {
  scheme: ColorScheme;
  onToggle: () => void;
}

export function ColorSchemeToggle({ scheme, onToggle }: ColorSchemeToggleProps) {
  const isDark = scheme === "dark";

  return (
    <motion.button
      type="button"
      className="color-scheme-toggle"
      onClick={onToggle}
      whileTap={{ scale: 0.9, rotate: 15 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22.5" y2="12" />
            <line x1="4.4" y1="4.4" x2="6.5" y2="6.5" />
            <line x1="17.5" y1="17.5" x2="19.6" y2="19.6" />
            <line x1="4.4" y1="19.6" x2="6.5" y2="17.5" />
            <line x1="17.5" y1="6.5" x2="19.6" y2="4.4" />
          </g>
        </svg>
      )}
    </motion.button>
  );
}
