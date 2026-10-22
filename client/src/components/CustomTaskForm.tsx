import { useState, type FormEvent } from "react";
import type { CustomTaskRecurrence, TaskType } from "../types";
import { TASK_TYPE_META } from "../utils/taskType";

interface CustomTaskFormProps {
  onSubmit: (payload: {
    name: string;
    type: TaskType;
    scheduledTime: string;
    recurrence: CustomTaskRecurrence;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TASK_TYPES = Object.keys(TASK_TYPE_META) as TaskType[];

export function CustomTaskForm({ onSubmit, onCancel, isSubmitting }: CustomTaskFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TaskType>("HABIT");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState<CustomTaskRecurrence>("DAILY");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please give your task a name.");
      return;
    }
    setError(null);
    onSubmit({ name: trimmed, type, scheduledTime, recurrence });
  }

  return (
    <form className="custom-task-form glass-glow" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Task name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Journal 3 gratitudes"
          maxLength={100}
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Time</span>
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Category</span>
        <div className="custom-task-form__type-picker">
          {TASK_TYPES.map((key) => (
            <button
              key={key}
              type="button"
              className={`custom-task-form__type-option ${TASK_TYPE_META[key].className} ${
                type === key ? "custom-task-form__type-option--active" : ""
              }`}
              onClick={() => setType(key)}
            >
              <span aria-hidden="true">{TASK_TYPE_META[key].icon}</span> {TASK_TYPE_META[key].label}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span className="field__label">Repeats</span>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as CustomTaskRecurrence)}
        >
          <option value="DAILY">Every day</option>
          <option value="ONE_TIME">Just today</option>
        </select>
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="custom-task-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add task"}
        </button>
      </div>
    </form>
  );
}
