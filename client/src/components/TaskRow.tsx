import { motion } from "framer-motion";
import type { Task } from "../types";
import { formatTime } from "../utils/time";
import { TaskTypeBadge } from "./TaskTypeBadge";
import { SPRING_TAP, TAP_SCALE } from "../utils/motion";

interface TaskRowProps {
  task: Task;
  /** Omit both handlers to render a read-only row (used in history view). */
  onComplete?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  onSwap?: (taskId: string) => void;
  isUpdating?: boolean;
  isSwapping?: boolean;
  index?: number;
}

export function TaskRow({
  task,
  onComplete,
  onSkip,
  onSwap,
  isUpdating,
  isSwapping,
  index = 0,
}: TaskRowProps) {
  const interactive = Boolean(onComplete || onSkip);
  const statusClass =
    task.status === "COMPLETED"
      ? "task-row--completed"
      : task.status === "SKIPPED"
        ? "task-row--skipped"
        : "";

  return (
    <motion.li
      className={`task-row ${statusClass}`.trim()}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.03 }}
      layout
    >
      <TaskTypeBadge type={task.type} />

      <div className="task-row__body">
        <div className="task-row__meta">
          <span className="task-row__time">{formatTime(task.scheduledTime)}</span>
          <span className="task-pill task-pill--points">+{task.pointsAwarded} pts</span>
          {task.status === "COMPLETED" && (
            <motion.span
              className="task-pill task-pill--done"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              Done
            </motion.span>
          )}
          {task.status === "SKIPPED" && (
            <span className="task-pill task-pill--skipped">Skipped</span>
          )}
        </div>
        <p className="task-row__name">{task.name}</p>
        {task.description && (
          <p className="task-row__description">{task.description}</p>
        )}
        {task.type === "MEAL" && !task.isCustom && (
          <div className="task-row__macros">
            <span className="macro-pill macro-pill--calories">{task.calories} kcal</span>
            <span className="macro-pill macro-pill--protein">{task.proteinG}g protein</span>
            <span className="macro-pill macro-pill--carbs">{task.carbsG}g carbs</span>
            <span className="macro-pill macro-pill--fat">{task.fatG}g fat</span>
          </div>
        )}
      </div>

      {interactive && (
        <div className="task-row__actions">
          <motion.button
            type="button"
            whileTap={TAP_SCALE} transition={SPRING_TAP}
            className={`task-action task-action--done ${
              task.status === "COMPLETED" ? "task-action--active" : ""
            }`}
            disabled={isUpdating}
            onClick={() => onComplete?.(task.id)}
            aria-pressed={task.status === "COMPLETED"}
          >
            {task.status === "COMPLETED" ? "✓ Done" : "Done"}
          </motion.button>
          <motion.button
            type="button"
            whileTap={TAP_SCALE} transition={SPRING_TAP}
            className={`task-action task-action--skip ${
              task.status === "SKIPPED" ? "task-action--active" : ""
            }`}
            disabled={isUpdating}
            onClick={() => onSkip?.(task.id)}
            aria-pressed={task.status === "SKIPPED"}
          >
            Skip
          </motion.button>
          {task.type === "MEAL" && !task.isCustom && onSwap && (
            <motion.button
              type="button"
              whileTap={TAP_SCALE} transition={SPRING_TAP}
              className="task-action task-action--swap"
              disabled={isUpdating || isSwapping}
              onClick={() => onSwap(task.id)}
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </motion.button>
          )}
        </div>
      )}
    </motion.li>
  );
}
