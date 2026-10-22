import { createContext, useContext, type ReactNode } from "react";
import { useRewardToastQueue } from "./useRewardToastQueue";
import type { RewardToastData } from "../components/RewardToast";

interface RewardToastContextValue {
  current: RewardToastData | null;
  push: (toast: RewardToastData) => void;
}

const RewardToastContext = createContext<RewardToastContextValue | null>(null);

/**
 * A single shared toast queue for the whole app tree, so a toast pushed
 * from TodayPage and one pushed from AppLayout's own effects (login bonus,
 * level-up) never collide as two independent, un-coordinated queues.
 */
export function RewardToastProvider({ children }: { children: ReactNode }) {
  const queue = useRewardToastQueue();
  return <RewardToastContext.Provider value={queue}>{children}</RewardToastContext.Provider>;
}

export function useSharedRewardToast(): RewardToastContextValue {
  const ctx = useContext(RewardToastContext);
  if (!ctx) {
    throw new Error("useSharedRewardToast must be used within a RewardToastProvider");
  }
  return ctx;
}
