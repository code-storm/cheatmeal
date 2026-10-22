import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface UnlockCelebrationContextValue {
  pendingSlug: string | null;
  celebrate: (slug: string) => void;
  clear: () => void;
}

const UnlockCelebrationContext = createContext<UnlockCelebrationContextValue | null>(null);

/**
 * Holds the slug of a just-unlocked skin until AppLayout (the sole owner
 * of document.body.dataset.theme) can read its colors and fire the
 * confetti celebration, then clears it. Kept as its own single-purpose
 * context rather than folded into RewardToastContext/RewardPreviewContext,
 * matching how those two are already split by concern.
 */
export function UnlockCelebrationProvider({ children }: { children: ReactNode }) {
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const celebrate = useCallback((slug: string) => setPendingSlug(slug), []);
  const clear = useCallback(() => setPendingSlug(null), []);

  return (
    <UnlockCelebrationContext.Provider value={{ pendingSlug, celebrate, clear }}>
      {children}
    </UnlockCelebrationContext.Provider>
  );
}

export function useUnlockCelebration(): UnlockCelebrationContextValue {
  const ctx = useContext(UnlockCelebrationContext);
  if (!ctx) {
    throw new Error("useUnlockCelebration must be used within an UnlockCelebrationProvider");
  }
  return ctx;
}
