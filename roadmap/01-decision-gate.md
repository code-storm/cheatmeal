# Decision Gate — Track A vs. Track B

This is the mechanism that decides which track's columns to read in [02-may-2027.md](02-may-2027.md) through [07-oct-2027.md](07-oct-2027.md). It's checked **once, mandatorily, at the end of April 2027** — the H1/H2 boundary, before H2 Phase 1 starts — and **once again, lightly, at the end of July 2027**, to catch a Track B opportunity emerging mid-H2, or a Track A shortfall that needs further scope-cutting.

## Primary gate — end of April 2027

| Signal | Track A (default) | Track B (upgrade trigger) | Source of truth |
|---|---|---|---|
| **WAU** | Real WAU roughly tracks the H1 model, ~700–1,300 | WAU materially exceeds target (>1,500) **and** a funding/hiring event has independently occurred — WAU alone never triggers Track B | H1 Phase 1 analytics |
| **D7/D30 retention** | In or near the modeled 30–45% range | N/A — retention doesn't trigger Track B on its own | H1 Phase 1 analytics |
| **Revenue-readiness proxy** | Cosmetic-shop engagement depth (% of WAU with ≥1 reward unlock, repeat shop visits) — informs future monetization exploration, doesn't gate the track choice itself | Same signal, higher bar — feeds H3 scoping either way | Rewards/shop usage data |
| **Team/funding event** | No co-founder, hire, or funding round has landed | A co-founder, hire, or funding round has actually landed by end of April — this is the real trigger | Founder's own knowledge |
| **Solo-founder bandwidth** | H1 Phases 1–6 shipped roughly on schedule | N/A | Honest retrospective against H1's own phase dates |

**Retention-shortfall contingency:** if D7 retention comes in near the ~8% industry baseline rather than the modeled 30–45%, this overrides everything else above. Both tracks collapse onto the same scope for May: retention-fix-only work, with all three H2 focus areas (light social, native eval, content expansion) deferred by at least one month. See the callout at the top of [02-may-2027.md](02-may-2027.md).

**Bandwidth note:** if H1 was already cutting scope by Phase 4–6 to stay on schedule, Track A's H2 pacing should assume *less* throughput per month than H1's own cadence, not the same — this changes how aggressive Track A's May–June plans should actually be, even though the written plan below assumes H1's cadence held.

## Secondary gate — end of July 2027

A lighter re-check, logged explicitly in [04-jul-2027.md](04-jul-2027.md):

- Re-check WAU trajectory and team/funding status only.
- If a funding or hiring event happens mid-H2 that wasn't there in April, this is where Track A can be **upgraded to Track B** for the August–October months — the plan explicitly allows this mid-stream switch rather than deciding once and locking in for six months.
- If nothing has changed, no action — Track A continues as planned.

## How to use the outcome

Once H1's real numbers are in, classify against the table above, then read **only** that track's column in each month file — don't mix Track A and Track B within a single month, since each track's features are sequenced assuming that track's own prerequisites from earlier months. If the retention-shortfall contingency applies, read the callout in [02-may-2027.md](02-may-2027.md) before anything else.

## What doesn't change regardless of track

- **WAU stays the metric.** No quiet redefinition. A secondary metric (D30 retention %, revenue-readiness signal) can be added, never substituted.
- **No full social network/forum/DMs/public profiles** — light social stops at read-only cohort aggregation in both tracks.
- **No committed native build** on Track A — only an evaluation and a written recommendation, until Track B explicitly unlocks a build.
- **No committed monetization build** in either track — exploratory signal-gathering at most.

Track B is never "now anything goes" — it's "the same floor, with more hands."
