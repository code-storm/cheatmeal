import { useState } from "react";
import { motion } from "framer-motion";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProgressBar } from "../components/ProgressBar";
import { TaskList } from "../components/TaskList";
import { useDayPlan } from "../hooks/useHistory";
import { formatFriendlyDate, shiftDateIso, todayIso } from "../utils/time";
import { PAGE_TRANSITION } from "../utils/motion";

export default function MacroHistoryPage() {
  const [date, setDate] = useState(todayIso());
  const query = useDayPlan(date);

  const consumed = query.data
    ? query.data.tasks
        .filter((t) => t.status === "COMPLETED" && t.type === "MEAL")
        .reduce(
          (acc, t) => ({
            calories: acc.calories + t.calories,
            proteinG: acc.proteinG + t.proteinG,
            carbsG: acc.carbsG + t.carbsG,
            fatG: acc.fatG + t.fatG,
          }),
          { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        )
    : null;

  const notFound =
    query.isError && query.error instanceof ApiError && query.error.status === 404;

  return (
    <div className="page page--macros">
      <header className="page-header">
        <h1>Macro history</h1>
        <p className="page-header__subtitle">Look back at a specific day's nutrition.</p>
      </header>

      <div className="macro-date-nav">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setDate((d) => shiftDateIso(d, -1))}
        >
          ← Previous day
        </button>
        <span className="macro-date-nav__current">{formatFriendlyDate(date)}</span>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={date >= todayIso()}
          onClick={() => setDate((d) => shiftDateIso(d, 1))}
        >
          Next day →
        </button>
      </div>

      {query.isLoading && <LoadingState label="Loading that day..." />}

      {query.isError && !notFound && (
        <ErrorState
          message={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      )}

      {notFound && <p className="history-empty">No plan recorded for this day.</p>}

      {query.data && consumed && (
        <motion.div
          key={date}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={PAGE_TRANSITION}
        >
          <div className="macro-summary">
            <ProgressBar
              completed={consumed.calories}
              total={query.data.macroTarget.calories}
              label={`Calories: ${consumed.calories} / ${query.data.macroTarget.calories}`}
            />
            <ProgressBar
              completed={consumed.proteinG}
              total={query.data.macroTarget.proteinG}
              label={`Protein: ${consumed.proteinG}g / ${query.data.macroTarget.proteinG}g`}
            />
            <ProgressBar
              completed={consumed.carbsG}
              total={query.data.macroTarget.carbsG}
              label={`Carbs: ${consumed.carbsG}g / ${query.data.macroTarget.carbsG}g`}
            />
            <ProgressBar
              completed={consumed.fatG}
              total={query.data.macroTarget.fatG}
              label={`Fat: ${consumed.fatG}g / ${query.data.macroTarget.fatG}g`}
            />
          </div>
          <TaskList tasks={query.data.tasks} />
        </motion.div>
      )}
    </div>
  );
}
