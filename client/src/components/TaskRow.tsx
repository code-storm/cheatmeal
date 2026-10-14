import type { Task } from "../types";
import { formatTime } from "../utils/time";
import { TaskTypeBadge } from "./TaskTypeBadge";

interface TaskRowProps {
  task: Task;
  /** Omit both handlers to render a read-only row (used in history view). */
  onComplete?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  isUpdating?: boolean;
}

export function TaskRow({ task, onComplete, onSkip, isUpdating }: TaskRowProps) {
  const interactive = Boolean(onComplete || onSkip);
  const statusClass =
    task.status === "COMPLETED"
      ? "task-row--completed"
      : task.status === "SKIPPED"
        ? "task-row--skipped"
        : "";

  return (
    <li className={`task-row ${statusClass}`.trim()}>
      <TaskTypeBadge type={task.type} />

      <div className="task-row__body">
        <div className="task-row__meta">
          <span className="task-row__time">{formatTime(task.scheduledTime)}</span>
          {task.status === "COMPLETED" && (
            <span className="task-pill task-pill--done">Done</span>
          )}
          {task.status === "SKIPPED" && (
            <span className="task-pill task-pill--skipped">Skipped</span>
          )}
        </div>
        <p className="task-row__name">{task.name}</p>
        {task.description && (
          <p className="task-row__description">{task.description}</p>
        )}
      </div>

      {interactive && (
        <div className="task-row__actions">
          <button
            type="button"
            className={`task-action task-action--done ${
              task.status === "COMPLETED" ? "task-action--active" : ""
            }`}
            disabled={isUpdating}
            onClick={() => onComplete?.(task.id)}
            aria-pressed={task.status === "COMPLETED"}
          >
            {task.status === "COMPLETED" ? "✓ Done" : "Done"}
          </button>
          <button
            type="button"
            className={`task-action task-action--skip ${
              task.status === "SKIPPED" ? "task-action--active" : ""
            }`}
            disabled={isUpdating}
            onClick={() => onSkip?.(task.id)}
            aria-pressed={task.status === "SKIPPED"}
          >
            Skip
          </button>
        </div>
      )}
    </li>
  );
}
