import { AnimatePresence, motion } from "framer-motion";

export interface RewardToastData {
  key: string;
  icon: string;
  label: string;
  tone?: "points" | "badge" | "level" | "login" | "grace";
}

interface RewardToastProps {
  toast: RewardToastData | null;
}

/**
 * A single AnimatePresence-driven toast, parametrized by icon/label/tone.
 * Used for task points, challenge bonus points, badge unlocks, level ups,
 * and the daily login bonus - callers decide what to show and when, this
 * just renders+animates whatever `toast` currently is.
 */
export function RewardToast({ toast }: RewardToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key}
          className={`reward-toast reward-toast--${toast.tone ?? "points"}`}
          role="status"
          initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: -10, scale: 0.95, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <span className="reward-toast__icon" aria-hidden="true">
            {toast.icon}
          </span>
          {toast.label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
