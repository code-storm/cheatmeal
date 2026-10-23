import { useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useProfile } from "../hooks/useProfile";
import { useColorScheme } from "../hooks/useColorScheme";
import { usePointerGlow } from "../hooks/usePointerGlow";
import { StreakBadge } from "./StreakBadge";
import { LevelProgress } from "./LevelProgress";
import { RewardToast } from "./RewardToast";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import { useSharedRewardToast } from "../hooks/RewardToastContext";
import { useRewardPreview } from "../hooks/RewardPreviewContext";
import { useUnlockCelebration } from "../hooks/UnlockCelebrationContext";
import { readSkinCssVars } from "../utils/skinColors";
import { fireUnlockConfetti } from "../utils/confetti";
import { PAGE_FADE_SCALE } from "../utils/motion";

const NAV_ITEMS = [
  { to: "/", label: "Today", icon: "📋" },
  { to: "/history", label: "History", icon: "📅" },
  { to: "/macros", label: "Macros", icon: "🍽️" },
  { to: "/rewards", label: "Rewards", icon: "🎁" },
  { to: "/wardrobe", label: "Wardrobe", icon: "👗" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

// TODO(polish phase): once AppLayout has a reason to fetch /api/rewards
// anyway, replace this with the already-fetched item's icon/imageUrl
// instead of a parallel hardcoded map - deferred for now since adding a
// new useRewards() call here would mean every page load fetches rewards,
// not just Wardrobe/Rewards, undoing the per-page-load latency work.
const AVATAR_ICON_BY_SLUG: Record<string, string> = {
  "avatar-blossom": "🌸",
  "avatar-moon": "🌙",
  "avatar-sprout": "🌱",
  "avatar-rainbow": "🌈",
  "avatar-tokidoki-mascot": "🌵",
};

export function AppLayout() {
  const { data } = useProfile();
  const profile = data?.profile;
  const level = data?.level;
  const location = useLocation();
  const { current: toast, push: pushToast } = useSharedRewardToast();
  const { scheme, toggle: toggleScheme } = useColorScheme();
  const { preview, clearPreview } = useRewardPreview();
  const { pendingSlug: pendingCelebrationSlug, clear: clearCelebration } = useUnlockCelebration();
  usePointerGlow();

  const prevLevelIndexRef = useRef<number | null>(null);

  // Apply the user's active skin by setting a data-theme attribute on <body>
  // - a small CSS block in index.css keys off this to re-map the --color-*
  // tokens, so every existing component re-colors automatically. A live
  // preview (from the Rewards page) takes priority over the real saved
  // skin, but nothing is persisted - it's purely a visual override.
  const effectiveSkinSlug =
    preview?.category === "SKIN" ? preview.slug : profile?.activeSkinSlug ?? "default";

  useEffect(() => {
    document.body.dataset.theme = effectiveSkinSlug;
    return () => {
      delete document.body.dataset.theme;
    };
  }, [effectiveSkinSlug]);

  // Clear any active preview on navigation, so it never leaks to another page.
  useEffect(() => {
    clearPreview();
    // Only ever reacting to a route change itself - clearPreview is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Fire a confetti celebration when a skin was just unlocked, in that
  // skin's own colors (read via a momentary data-theme flip, not a
  // hardcoded TS color map) - this effect is the sole place that reads
  // skin colors for an arbitrary slug, since it's co-located with the
  // only other writer of document.body.dataset.theme (the effect above).
  useEffect(() => {
    if (!pendingCelebrationSlug) return;
    const { accent, aurora } = readSkinCssVars(pendingCelebrationSlug);
    fireUnlockConfetti([accent, ...aurora]);
    clearCelebration();
  }, [pendingCelebrationSlug, clearCelebration]);

  useEffect(() => {
    if (data?.loginBonusAwarded) {
      pushToast({
        key: `login-bonus-${Date.now()}`,
        icon: "☀️",
        label: `+${data.loginBonusAwarded.points} daily login bonus!`,
        tone: "login",
      });
    }
    // Only fire when the server actually reports a fresh bonus - safe to
    // depend on the whole object since it's only ever present once per day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.loginBonusAwarded]);

  useEffect(() => {
    if (!level) return;
    if (prevLevelIndexRef.current !== null && level.index > prevLevelIndexRef.current) {
      pushToast({
        key: `level-up-${level.index}`,
        icon: level.icon,
        label: `Level up! You're now ${level.name}`,
        tone: "level",
      });
    }
    prevLevelIndexRef.current = level.index;
  }, [level, pushToast]);

  // A preview (real icon/imageUrl, already carried on the preview object)
  // takes priority over the real activeAvatar the profile request
  // resolved server-side; AVATAR_ICON_BY_SLUG is only a fallback for the
  // rare case neither is available (e.g. still loading).
  const effectiveAvatarSlug =
    preview?.category === "AVATAR" ? preview.slug : profile?.activeAvatarSlug ?? null;
  const avatarImageUrl = preview?.category === "AVATAR" ? preview.imageUrl : data?.activeAvatar?.imageUrl ?? null;
  const avatarIcon = effectiveAvatarSlug
    ? (preview?.category === "AVATAR" ? preview.icon : data?.activeAvatar?.icon) ??
      AVATAR_ICON_BY_SLUG[effectiveAvatarSlug] ??
      "🙂"
    : null;

  // Rendered twice (top pill nav on desktop, fixed bottom bar on mobile/
  // tablet) rather than CSS-repositioned in place: backdrop-filter on an
  // ancestor (.app-header__inner) establishes a new containing block for
  // fixed-position descendants, so a nav nested inside it can never
  // actually anchor to the viewport - the bottom bar needs to be its own
  // top-level sibling of .app-shell's children, not just a repositioned
  // version of the same DOM node. CSS (not JS) still decides which of the
  // two is visible at a given width, so there's no duplicated state.
  const navLinks = NAV_ITEMS.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}
      end={item.to === "/"}
    >
      <span className="app-nav__icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="app-nav__label">{item.label}</span>
    </NavLink>
  ));

  return (
    <div className="app-shell">
      {/* Zero-size SVG def, mounted once: the real macOS-style liquid-glass
          refraction (edge distortion + specular rim highlight), built from
          native SVG filter primitives only (feTurbulence/feSpecularLighting),
          so there's no baked displacement-map asset to generate/maintain.
          Only Chromium supports backdrop-filter: url(#...) - index.css gates
          every usage behind @supports, so this is purely additive and never
          the only source of a surface's glass look. */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
        aria-hidden="true"
        focusable="false"
      >
        <filter id="liquid-glass-edge" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.025"
            numOctaves={2}
            seed={7}
            stitchTiles="stitch"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation={2} result="smoothNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothNoise"
            scale={14}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feSpecularLighting
            in="smoothNoise"
            surfaceScale={4}
            specularConstant={0.9}
            specularExponent={12}
            lightingColor="#ffffff"
            result="specular"
          >
            <feDistantLight azimuth={235} elevation={55} />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularClipped" />
          <feComposite in="displaced" in2="specularClipped" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} />
        </filter>
      </svg>
      <div className="ambient-bg-image" aria-hidden="true" />
      <div className="ambient-fx" aria-hidden="true" />
      <RewardToast toast={toast} />
      <AnimatePresence>
        {preview && (
          <motion.div
            className="preview-pill"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            Previewing {preview.name}
            <button type="button" className="preview-pill__exit" onClick={clearPreview}>
              Exit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="app-header">
        <div className="app-header__inner glass-glow">
          <span className="app-logo">CheatMeal</span>
          <nav className="app-nav app-nav--top">{navLinks}</nav>
          <div className="app-header__status">
            <ColorSchemeToggle scheme={scheme} onToggle={toggleScheme} />
            {avatarImageUrl ? (
              <img src={avatarImageUrl} alt="" className="app-avatar app-avatar--image" aria-hidden="true" />
            ) : (
              avatarIcon && (
                <span className="app-avatar" aria-hidden="true">
                  {avatarIcon}
                </span>
              )
            )}
            {level && <LevelProgress level={level} compact />}
            {profile && <StreakBadge currentStreak={profile.currentStreak} />}
            {profile && <span className="points-badge">⭐ {profile.pointsBalance}</span>}
          </div>
        </div>
      </header>
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...PAGE_FADE_SCALE}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="app-nav app-nav--bottom">{navLinks}</nav>
    </div>
  );
}
