import { useState } from "react";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProgressRing } from "../components/ProgressBar";
import { TaskList } from "../components/TaskList";
import { useDayPlan, useHistory } from "../hooks/useHistory";
import { formatFriendlyDate, formatShortDate } from "../utils/time";
import type { HistoryDay } from "../types";

export default function HistoryPage() {
  const { data, isLoading, isError, error, refetch } = useHistory();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="page page--history">
        <LoadingState label="Loading your history..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page page--history">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const days = [...data.days].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="page page--history">
      <header className="page-header">
        <h1>Your history</h1>
        <p className="page-header__subtitle">The last 30 days, day by day.</p>
      </header>

      {days.length === 0 ? (
        <p className="history-empty">No history yet — come back after your first day.</p>
      ) : (
        <ul className="history-list">
          {days.map((day) => (
            <HistoryDayRow
              key={day.date}
              day={day}
              isExpanded={expandedDate === day.date}
              onToggle={() =>
                setExpandedDate((current) => (current === day.date ? null : day.date))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryDayRow({
  day,
  isExpanded,
  onToggle,
}: {
  day: HistoryDay;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const dayPlanQuery = useDayPlan(isExpanded ? day.date : null);

  return (
    <li className="history-day">
      <button
        type="button"
        className="history-day__summary"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="history-day__date-block">
          <span className="history-day__date">{formatShortDate(day.date)}</span>
          <span className="history-day__full-date">{formatFriendlyDate(day.date)}</span>
        </div>
        <div className="history-day__stats">
          <span className="history-day__ratio">
            {day.completedCount}/{day.totalCount} done
          </span>
          {day.skippedCount > 0 && (
            <span className="history-day__skipped">{day.skippedCount} skipped</span>
          )}
        </div>
        <ProgressRing completed={day.completedCount} total={day.totalCount} size={40} />
      </button>

      {isExpanded && (
        <div className="history-day__detail">
          {dayPlanQuery.isLoading && <LoadingState label="Loading that day..." />}

          {dayPlanQuery.isError &&
            (dayPlanQuery.error instanceof ApiError && dayPlanQuery.error.status === 404 ? (
              <p className="history-day__empty">No plan recorded for this day.</p>
            ) : (
              <ErrorState
                message={
                  dayPlanQuery.error instanceof Error
                    ? dayPlanQuery.error.message
                    : undefined
                }
                onRetry={() => dayPlanQuery.refetch()}
              />
            ))}

          {dayPlanQuery.data && <TaskList tasks={dayPlanQuery.data.tasks} />}
        </div>
      )}
    </li>
  );
}
