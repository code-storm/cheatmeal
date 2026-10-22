import { motion } from "framer-motion";
import { PAGE_TRANSITION, TAP_SCALE, SPRING_TAP } from "../utils/motion";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong on our end.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      className="error-state"
      role="alert"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={PAGE_TRANSITION}
    >
      <p className="error-state__title">We hit a snag</p>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <motion.button
          type="button"
          className="btn btn--secondary"
          whileTap={TAP_SCALE}
          transition={SPRING_TAP}
          onClick={onRetry}
        >
          Try again
        </motion.button>
      )}
    </motion.div>
  );
}
