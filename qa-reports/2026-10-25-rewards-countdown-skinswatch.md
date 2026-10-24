# QA Report — Rewards/Wardrobe/EventBanner countdown + SkinSwatch changes

**Status (2026-10-25): bugs #1, #2, #3 all fixed and verified in-browser.**
Items #4/#5 are unconfirmed/pre-existing and were not acted on - see their
own sections below for why.

Scope tested: the uncommitted changes to `AppLayout.tsx`, `EventBanner.tsx`,
`RewardCard.tsx`, `SkinSwatch.tsx`, `EventDetailPage.tsx`, `RewardsPage.tsx`,
`WardrobePage.tsx`, and the new `useCountdown` hook. Tested in the browser
preview against the local dev server with a fresh signed-up account,
light/dark mode, and a mobile viewport (375×812).

## Bugs

### 1. SkinSwatch module cache goes stale on light/dark toggle (High) — ✅ FIXED
`client/src/components/SkinSwatch.tsx:23` caches `readSkinCssVars(slug)`
results in a module-level `Map` keyed only by `slug`. But the CSS vars it
reads (`--accent`, `--aurora-stop-*`) are also overridden per color scheme
(`:root[data-color-scheme="dark"] body[data-theme="..."]` rules in
`client/src/index.css`), so the same slug has different colors in light vs.
dark mode.

**Repro:**
1. Load Rewards page in dark mode → swatch for "Lavender Dusk" reads/caches
   the dark-mode gradient (confirmed: `rgb(36,28,46) / rgb(199,168,232) /
   rgb(31,24,40)`).
2. Toggle to light mode (no reload) → swatch keeps showing the dark-mode
   colors instead of light-mode ones (`rgb(233,220,242) / rgb(141,106,184) /
   rgb(227,214,238)`, confirmed correct only after a full page reload).

**Impact:** every skin swatch rendered before a color-scheme toggle shows
wrong, mismatched colors until the user reloads the page. Visually jarring
since it's the exact kind of "distinct, correct look per skin" guarantee the
swatch was built for.

**Suggested fix:** key the cache by `` `${slug}:${colorScheme}` ``, or just
clear/rebuild the cache on `ColorSchemeToggle`'s toggle.

**Actual fix (2026-10-25):** Two changes were needed, not one:
1. `SkinSwatch.tsx`'s cache is now keyed by `` `${slug}:${colorScheme}` ``
   as suggested.
2. That alone wasn't sufficient: `useColorScheme.ts` previously held
   `scheme` in local `useState` inside whichever single component called
   the hook (only `AppLayout`), so no other component in the tree -
   `SkinSwatch`, rendered from `RewardsPage`/`WardrobePage`'s separate
   subtree - had any prop/state telling it to re-render when the scheme
   changed elsewhere. Rewrote `useColorScheme.ts` as a genuine
   `useSyncExternalStore`-backed external store (module-level state +
   DOM-attribute write, broadcast to all subscribers), and had
   `SkinSwatch` call `useColorScheme()` itself (previously it never
   called the hook at all) purely to subscribe and force a re-render on
   toggle.

Verified in-browser: toggled color scheme twice (dark→light→dark) without
reloading on the Rewards page; swatch gradients for Lavender Dusk/Ocean
Calm/Golden Hour updated correctly and immediately both times, matching
the same RGB values a fresh page load produces for each scheme.

### 2. "Featured · 25% off" badge shown on not-yet-purchasable UPCOMING items (Medium) — ✅ FIXED
`client/src/components/RewardCard.tsx:86-92` renders the featured-discount
badge and struck-through price whenever `item.featured && !item.unlocked`,
with no check for `purchasable`/`expiredForUser`. For an event item that is
still `UPCOMING` (not purchasable yet), the card simultaneously shows:
- "Featured · 25% off" + struck `180` / `135 pts`
- "Coming in 21d 5h" (expired-label, no action available)

**Repro:** Rewards page → "Tokidoki Ciao Ciao" card (event `UPCOMING`,
`featured: true`). Confirmed on both desktop and mobile (375×812) layouts.

**Impact:** reads as an active, actionable discount you could buy right now,
but there is no Unlock button — misleading, especially for a "limited time
deal" framing stacked on top of "not available yet."

**Suggested fix:** gate the featured badge/struck-price block on
`!expiredForUser` as well (same condition already used for the progress bar
a few lines below).

**Actual fix (2026-10-25):** Added `&& !expiredForUser` to both conditions
in `RewardCard.tsx` as suggested - the featured-badge span and the
struck-price branch in the cost line. Verified in-browser: the "Tokidoki
Ciao Ciao" card (still `UPCOMING`/`featured: true`) now shows only the
plain `180 pts` cost and the "Coming in 21d 4h" countdown, with no
featured badge or struck price.

### 3. Progress bar/label overflow once balance exceeds cost (Low/cosmetic) — ✅ FIXED
`client/src/components/RewardCard.tsx:121-130`: the progress section renders
whenever `!item.unlocked && !expiredForUser`, with no check for `canAfford`.
Once the user's point balance exceeds the item's cost (but before they've
clicked Unlock), the card shows a maxed-out bar and a label like `70/50 pts`
— i.e. "have" exceeds "need" — right next to an enabled "Unlock" button.

**Repro:** earn > item cost (e.g. 70 pts with a 50pt item) without unlocking
it yet → card shows "70/50 pts" under a full-width progress bar.

**Suggested fix:** hide the progress block (or clamp/relabel it) once
`canAfford` is true, since the Unlock button already communicates
affordability at that point.

**Actual fix (2026-10-25):** Added `&& !canAfford` to the progress block's
render condition in `RewardCard.tsx`, as suggested. Verified in-browser:
earned 60 points (cheapest items are 50pt avatars), reloaded Rewards -
"Blossom"/"Crescent" (50pt, affordable at 65 balance) show no progress
bar, just cost + enabled Unlock button; "Sprout" (100pt, not yet
affordable) still correctly shows its `65/100 pts` bar.

## Non-blocking / inconclusive

### 4. EventDetailPage stuck at `opacity:0` after SPA navigation (Unconfirmed — flaky)
Once, navigating client-side from the Today page's `EventBanner` link into
`/events/cheatmeal-x-tokidoki` left the route's `motion.div` wrapper
(`AppLayout.tsx`'s `PAGE_FADE_SCALE`/`AnimatePresence mode="popLayout"`)
permanently at `opacity: 0` (content present in the DOM, just invisible —
confirmed via `getComputedStyle`). A full reload at the same URL rendered
fine, and a later repeat of the exact same SPA navigation worked correctly.
Vite HMR logs show other files being hot-reloaded in the same window
(`AppLayout.tsx` itself included), which is the likely confound — a dev-only
HMR race, not necessarily a real bug. **Flagging for awareness, not
confirmed** — worth a second look if a teammate sees a genuinely blank
event page in a non-HMR (e.g. production build) context.

### 5. Transient `/api/profile` 500 on first login-bonus check (Pre-existing, not from this diff)
First `/api/profile` call for a new account intermittently 500s:
```
PrismaClientUnknownRequestError ... ConnectorError(ConnectionError(Timed out during query execution.))
  at awardPoints (server/src/services/points.service.ts:27)
  at profile.routes.ts:45 ($transaction)
```
Self-resolves on the client's automatic retry (next `/api/profile` call
returns 200), so it's not currently user-visible, but worth a look since
it's a DB connection timeout inside the daily-login-bonus transaction —
unrelated to the frontend diff under test. Logged here for visibility, not
as a blocker for this change set.

## Verified working correctly
- Signup → onboarding → Today plan flow.
- Reward unlock → activate → remove cycle (points deduct/refund correctly,
  header avatar updates live).
- Skin/avatar Preview pill: applies live theme, "Exit" clears it, and
  navigating to another route auto-clears the preview (confirmed via
  `AppLayout.tsx`'s pathname-keyed effect).
- `useCountdown`-driven countdown text on `EventBanner` ("Coming in 21d 5h")
  and on locked `RewardCard`s for `UPCOMING` event items.
- Dark mode legibility across Today/Rewards pages, including the event
  banner and task list.
- Mobile layout (375×812): single-column reward grid, bottom nav, no text
  clipping on the countdown/featured badge stack (bug #2 reproduces
  identically there, just more visually cramped).
