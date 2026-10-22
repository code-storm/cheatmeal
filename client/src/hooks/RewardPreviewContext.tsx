import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { RewardCategory } from "../types";

export interface RewardPreview {
  category: RewardCategory;
  slug: string;
  name: string;
}

interface RewardPreviewContextValue {
  preview: RewardPreview | null;
  startPreview: (preview: RewardPreview) => void;
  clearPreview: () => void;
}

const RewardPreviewContext = createContext<RewardPreviewContextValue | null>(null);

/**
 * Lets the Rewards page temporarily apply a locked or unlocked skin/avatar
 * across the whole app chrome - no points spent, nothing persisted - so a
 * user can see it before deciding to unlock it. AppLayout reads this to
 * override the real profile's activeSkinSlug/activeAvatarSlug while a
 * preview is active, and renders the "Previewing... Exit" pill.
 */
export function RewardPreviewProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<RewardPreview | null>(null);

  const startPreview = useCallback((next: RewardPreview) => setPreview(next), []);
  const clearPreview = useCallback(() => setPreview(null), []);

  const value = useMemo(
    () => ({ preview, startPreview, clearPreview }),
    [preview, startPreview, clearPreview],
  );

  return <RewardPreviewContext.Provider value={value}>{children}</RewardPreviewContext.Provider>;
}

export function useRewardPreview(): RewardPreviewContextValue {
  const ctx = useContext(RewardPreviewContext);
  if (!ctx) {
    throw new Error("useRewardPreview must be used within a RewardPreviewProvider");
  }
  return ctx;
}
