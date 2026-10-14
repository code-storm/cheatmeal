import type { Task } from "../types";
import { TIME_OF_DAY_ORDER, timeOfDayFor, parseTimeToMinutes } from "../utils/time";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  updatingTaskId?: string | null;
}

export function TaskList({ tasks, onComplete, onSkip, updatingTaskId }: TaskListProps) {
  const grouped = TIME_OF_DAY_ORDER.map((period) => ({
    period,
    tasks: tasks
      .filter((task) => timeOfDayFor(task.scheduledTime) === period)
      .sort(
        (a, b) => parseTimeToMinutes(a.scheduledTime) - parseTimeToMinutes(b.scheduledTime),
      ),
  })).filter((group) => group.tasks.length > 0);

  if (grouped.length === 0) {
    return <p className="task-list__empty">No tasks for this day.</p>;
  }

  return (
    <div className="task-list">
      {grouped.map((group) => (
        <section key={group.period} className="task-section">
          <h2 className="task-section__heading">{group.period}</h2>
          <ul className="task-section__list">
            {group.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={onComplete}
                onSkip={onSkip}
                isUpdating={updatingTaskId === task.id}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
