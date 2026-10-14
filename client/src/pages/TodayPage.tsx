import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProgressBar } from "../components/ProgressBar";
import { TaskList } from "../components/TaskList";
import { useTodayPlan, useUpdateTaskStatus } from "../hooks/useTodayPlan";
import { formatFriendlyDate } from "../utils/time";

export default function TodayPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTodayPlan();
  const updateTask = useUpdateTaskStatus();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const profileRequired =
    error instanceof ApiError && error.status === 400 && error.message === "Profile required";

  useEffect(() => {
    if (profileRequired) {
      navigate("/onboarding", { replace: true });
    }
  }, [profileRequired, navigate]);

  if (isLoading) {
    return (
      <div className="page page--today">
        <LoadingState label="Fetching today's plan..." />
      </div>
    );
  }

  if (profileRequired) {
    // Redirect effect above will fire; render nothing meaningful meanwhile.
    return null;
  }

  if (isError || !data) {
    return (
      <div className="page page--today">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const { tasks, pregnancyWeek, date } = data;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  function handleStatusChange(taskId: string, status: "COMPLETED" | "SKIPPED") {
    const task = tasks.find((t) => t.id === taskId);
    // Clicking the same action again toggles back to pending.
    const nextStatus = task?.status === status ? "PENDING" : status;

    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, status: nextStatus },
      { onSettled: () => setUpdatingTaskId(null) },
    );
  }

  return (
    <div className="page page--today">
      <header className="today-header">
        <p className="today-header__eyebrow">Week {pregnancyWeek}</p>
        <h1 className="today-header__title">
          You're in week {pregnancyWeek} — here's today's plan
        </h1>
        <p className="today-header__date">{formatFriendlyDate(date)}</p>
        <ProgressBar
          completed={completedCount}
          total={tasks.length}
          label={`${completedCount} of ${tasks.length} done today`}
        />
      </header>

      <TaskList
        tasks={tasks}
        onComplete={(id) => handleStatusChange(id, "COMPLETED")}
        onSkip={(id) => handleStatusChange(id, "SKIPPED")}
        updatingTaskId={updatingTaskId}
      />
    </div>
  );
}
