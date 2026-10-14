import type { TaskType } from "../types";

interface TaskTypeMeta {
  label: string;
  icon: string;
  className: string;
}

// Distinct colors + a simple emoji glyph per task type. Emoji keeps this
// dependency-free while still reading as a deliberate icon system rather
// than default browser styling.
export const TASK_TYPE_META: Record<TaskType, TaskTypeMeta> = {
  MEAL: { label: "Meal", icon: "🍽️", className: "task-type--meal" },
  EXERCISE: { label: "Exercise", icon: "🧘", className: "task-type--exercise" },
  HABIT: { label: "Habit", icon: "💧", className: "task-type--habit" },
  GROOMING: { label: "Grooming", icon: "✨", className: "task-type--grooming" },
};
