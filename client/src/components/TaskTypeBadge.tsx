import type { TaskType } from "../types";
import { TASK_TYPE_META } from "../utils/taskType";

export function TaskTypeBadge({ type }: { type: TaskType }) {
  const meta = TASK_TYPE_META[type];
  return (
    <span className={`task-type-badge ${meta.className}`} title={meta.label}>
      <span aria-hidden="true">{meta.icon}</span>
    </span>
  );
}
