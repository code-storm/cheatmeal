// Hand-drawn SVG line icons for the main nav, replacing plain emoji glyphs
// (📋 📅 🍽️ 🎁 👗 👤) - those render with a visible, inconsistent style per
// OS/browser emoji font and looked out of place next to ColorSchemeToggle's
// own hand-drawn SVGs right in the same header. Same visual language as
// that component: viewBox 0 0 24 24, fill="none" root, strokeWidth 1.8,
// round caps/joins, color via `currentColor` so each icon automatically
// follows .app-nav__link's existing color/hover/active states with no
// extra prop needed.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// Today - a checklist (clipboard with a completed task line), matching
// this app's actual daily-checklist concept more directly than a generic
// calendar/home glyph would.
export function TodayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.2" />
      <path d="M9 4.5V3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8.5 11.5l1.5 1.5 3-3" />
      <line x1="8.5" y1="16.5" x2="15.5" y2="16.5" />
    </BaseIcon>
  );
}

// History - a calendar, distinct from Today's checklist by showing a
// grid of past days rather than a single checked-off list.
export function HistoryIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6.5" />
      <line x1="16" y1="3" x2="16" y2="6.5" />
      <line x1="8" y1="13" x2="8" y2="13.01" />
      <line x1="12" y1="13" x2="12" y2="13.01" />
      <line x1="16" y1="13" x2="16" y2="13.01" />
      <line x1="8" y1="16.5" x2="8" y2="16.51" />
      <line x1="12" y1="16.5" x2="12" y2="16.51" />
    </BaseIcon>
  );
}

// Macros - a plate with a fork and knife, reads as "food/nutrition"
// without the busy rendering of the 🍽️ emoji at nav size.
export function MacrosIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7" />
      <path d="M8 8.5v3a1.3 1.3 0 0 0 2.6 0v-3" />
      <line x1="9.3" y1="8.5" x2="9.3" y2="16" />
      <path d="M15.6 8.5c-.9.4-1.4 1.2-1.4 2.3 0 1 .5 1.7 1.2 2v3.2" />
    </BaseIcon>
  );
}

// Rewards - a gift box, kept geometric (box + ribbon cross + bow) rather
// than the 🎁 emoji's more ornate default rendering.
export function RewardsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <line x1="12" y1="10" x2="12" y2="20" />
      <path d="M12 10c-1.6 0-3-.8-3-2.5A2 2 0 0 1 11 5.5c1.3 0 2 1.2 2 2.2" />
      <path d="M12 10c1.6 0 3-.8 3-2.5A2 2 0 0 0 13 5.5c-1.3 0-2 1.2-2 2.2" />
    </BaseIcon>
  );
}

// Wardrobe - a hanger, the clearest single-glyph stand-in for "skins /
// what you're wearing" without relying on the 👗 emoji's single fixed
// garment silhouette.
export function WardrobeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="5.5" r="1.4" />
      <path d="M12 6.8v2" />
      <path d="M4 17.5l7.3-5.1a1 1 0 0 1 1.1 0l7.6 5.3" />
      <line x1="3" y1="18.5" x2="21" y2="18.5" />
    </BaseIcon>
  );
}

// Profile - a simple head-and-shoulders, the universal account glyph.
export function ProfileIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </BaseIcon>
  );
}
