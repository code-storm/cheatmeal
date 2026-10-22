import { useCallback, useEffect, useRef, useState } from "react";
import type { RewardToastData } from "../components/RewardToast";

const DISPLAY_MS = 2200;

/**
 * A tiny FIFO queue for reward-event toasts (points, badges, level-ups,
 * login bonus...). Several things can unlock in the same response (e.g. a
 * task completion that also crosses a badge threshold), so callers push as
 * many toasts as they like and this shows them one at a time.
 */
export function useRewardToastQueue() {
  const [current, setCurrent] = useState<RewardToastData | null>(null);
  const queueRef = useRef<RewardToastData[]>([]);

  const pump = useCallback(() => {
    setCurrent((prev) => {
      if (prev !== null) return prev;
      return queueRef.current.shift() ?? null;
    });
  }, []);

  const push = useCallback(
    (toast: RewardToastData) => {
      queueRef.current.push(toast);
      pump();
    },
    [pump],
  );

  useEffect(() => {
    if (current === null) return;
    const timer = setTimeout(() => {
      setCurrent(null);
    }, DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (current === null) pump();
  }, [current, pump]);

  return { current, push };
}
