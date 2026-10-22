import { motion } from "framer-motion";
import type { Task } from "../types";
import { TIME_OF_DAY_ORDER, timeOfDayFor, parseTimeToMinutes } from "../utils/time";
import { TaskRow } from "./TaskRow";
import { PAGE_TRANSITION } from "../utils/motion";

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  onSwap?: (taskId: string) => void;
  updatingTaskId?: string | null;
  swappingTaskId?: string | null;
}

export function TaskList({
  tasks,
  onComplete,
  onSkip,
  onSwap,
  updatingTaskId,
  swappingTaskId,
}: TaskListProps) {
  const grouped = TIME_OF_DAY_ORDER.map((period) => ({
    period,
    tasks: tasks
      .filter((task) => timeOfDayFor(task.scheduledTime) === period)
      .sort(
        (a, b) => parseTimeToMinutes(a.scheduledTime) - parseTimeToMinutes(b.scheduledTime),
      ),
  })).filter((group) => group.tasks.length > 0);

  if (grouped.length === 0) {
    return (
      <motion.p
        className="task-list__empty"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={PAGE_TRANSITION}
      >
        No tasks for this day.
      </motion.p>
    );
  }

  return (
    <div className="task-list">
      {grouped.map((group) => (
        <section key={group.period} className="task-section">
          <h2 className="task-section__heading">{group.period}</h2>
          <ul className="task-section__list">
            {group.tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={onComplete}
                onSkip={onSkip}
                onSwap={onSwap}
                isUpdating={updatingTaskId === task.id}
                isSwapping={swappingTaskId === task.id}
                index={i}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
