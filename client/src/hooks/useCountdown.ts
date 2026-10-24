import { useEffect, useState } from "react";

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

function diffParts(targetMs: number, now: number): CountdownParts {
  const totalMs = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

// Tick frequency scales with how far away the target is - a countdown
// three weeks out re-rendering once a second would be ~1800x more work
// than the display value actually needs (it only visibly changes once a
// minute at that distance), and would reintroduce exactly the kind of
// needless-render jank this app's SkinSwatch forced-reflow fix
// (skinColors.ts) was just about eliminating elsewhere. Close-in
// countdowns (under an hour) tick every second since the seconds digit
// is the whole point there.
function tickIntervalFor(remainingMs: number): number {
  if (remainingMs > ONE_DAY) return ONE_MINUTE;
  if (remainingMs > ONE_HOUR) return 15 * ONE_SECOND;
  return ONE_SECOND;
}

/**
 * Live countdown to a target ISO timestamp. Ticks at an adaptive
 * interval (coarser the further away the target is, see tickIntervalFor)
 * via a self-rescheduling setTimeout rather than a fixed setInterval, so
 * the cadence itself updates as the target gets closer without drifting.
 * Returns null when there's no target to count down to - callers decide
 * what (if anything) to render in that case.
 */
export function useCountdown(targetIso: string | null | undefined): CountdownParts | null {
  const targetMs = targetIso ? new Date(targetIso).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;

    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const current = Date.now();
      setNow(current);
      if (current < targetMs!) {
        timer = setTimeout(tick, tickIntervalFor(targetMs! - current));
      }
    }
    timer = setTimeout(tick, tickIntervalFor(targetMs - Date.now()));

    return () => clearTimeout(timer);
  }, [targetMs]);

  if (targetMs == null) return null;
  return diffParts(targetMs, now);
}

/** Short, label-friendly rendering of a CountdownParts - "3d 4h", "2h 15m", "45m 12s", "8s". */
export function formatCountdown(parts: CountdownParts): string {
  if (parts.totalMs <= 0) return "now";
  if (parts.days > 0) return `${parts.days}d ${parts.hours}h`;
  if (parts.hours > 0) return `${parts.hours}h ${parts.minutes}m`;
  if (parts.minutes > 0) return `${parts.minutes}m ${parts.seconds}s`;
  return `${parts.seconds}s`;
}
