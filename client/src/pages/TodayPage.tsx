import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { ProgressBar } from "../components/ProgressBar";
import { CustomTaskForm } from "../components/CustomTaskForm";
import { TaskList } from "../components/TaskList";
import { TipsCarousel } from "../components/TipsCarousel";
import { DailyChallengesCard } from "../components/DailyChallengesCard";
import { useSwapTask, useTodayPlan, useUpdateTaskStatus } from "../hooks/useTodayPlan";
import { useCreateCustomTask, useUpdateCustomTaskInstanceStatus } from "../hooks/useCustomTasks";
import { useChallenges, useUpdateChallengeStatus } from "../hooks/useChallenges";
import { useTips } from "../hooks/useTips";
import { useSharedRewardToast } from "../hooks/RewardToastContext";
import { useEvents } from "../hooks/useEvents";
import { EventBanner } from "../components/EventBanner";
import { formatFriendlyDate } from "../utils/time";
import type { BadgeDTO, CreateCustomTaskPayload, TaskStatus } from "../types";

export default function TodayPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTodayPlan();
  const { data: challengesData } = useChallenges();
  const { data: tipsData } = useTips();
  const { data: eventsData } = useEvents();
  const updateTask = useUpdateTaskStatus();
  const updateCustomInstance = useUpdateCustomTaskInstanceStatus();
  const updateChallenge = useUpdateChallengeStatus();
  const swapTask = useSwapTask();
  const createCustomTask = useCreateCustomTask();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [swappingTaskId, setSwappingTaskId] = useState<string | null>(null);
  const [completingChallengeId, setCompletingChallengeId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const { push: pushToast } = useSharedRewardToast();

  const profileRequired =
    error instanceof ApiError && error.status === 400 && error.message === "Profile required";

  useEffect(() => {
    if (profileRequired) {
      navigate("/onboarding", { replace: true });
    }
  }, [profileRequired, navigate]);

  function announcePoints(points: number) {
    if (points > 0) pushToast({ key: `points-${Date.now()}`, icon: "⭐", label: `+${points} points!`, tone: "points" });
  }

  function announceBadges(badges: BadgeDTO[]) {
    for (const badge of badges) {
      pushToast({ key: `badge-${badge.slug}`, icon: badge.icon, label: `Badge unlocked: ${badge.name}`, tone: "badge" });
    }
  }

  function announceGraceToken(consumed: boolean) {
    if (consumed) {
      pushToast({
        key: `grace-${Date.now()}`,
        icon: "🛡️",
        label: "Missed a day - a grace token saved your streak!",
        tone: "grace",
      });
    }
  }

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
    const nextStatus: TaskStatus = task?.status === status ? "PENDING" : status;

    setUpdatingTaskId(taskId);
    const onSettledCommon = () => setUpdatingTaskId(null);
    const onSuccessCommon = (result: {
      pointsDelta: number;
      newBadges: BadgeDTO[];
      graceTokenConsumed: boolean;
    }) => {
      announcePoints(result.pointsDelta);
      announceBadges(result.newBadges);
      announceGraceToken(result.graceTokenConsumed);
    };

    if (task?.isCustom) {
      updateCustomInstance.mutate(
        { instanceId: taskId, status: nextStatus },
        { onSuccess: onSuccessCommon, onSettled: onSettledCommon },
      );
    } else {
      updateTask.mutate(
        { taskId, status: nextStatus },
        { onSuccess: onSuccessCommon, onSettled: onSettledCommon },
      );
    }
  }

  function handleSwap(taskId: string) {
    setSwappingTaskId(taskId);
    swapTask.mutate({ taskId }, { onSettled: () => setSwappingTaskId(null) });
  }

  function handleCreateCustomTask(payload: CreateCustomTaskPayload) {
    createCustomTask.mutate(payload, {
      onSuccess: (result) => {
        setShowAddTask(false);
        announceBadges(result.newBadges);
      },
    });
  }

  function handleCompleteChallenge(id: string, proofCaption?: string) {
    setCompletingChallengeId(id);
    updateChallenge.mutate(
      { id, status: "COMPLETED", proofCaption },
      {
        onSuccess: (result) => {
          pushToast({
            key: `challenge-${id}`,
            icon: "🎯",
            label: `+${result.challenge.bonusPoints} bonus points!`,
            tone: "points",
          });
          announceBadges(result.newBadges);
        },
        onSettled: () => setCompletingChallengeId(null),
      },
    );
  }

  return (
    <div className="page page--today">
      {eventsData?.events.map((event) => <EventBanner key={event.slug} event={event} />)}

      {tipsData && tipsData.tips.length > 0 && <TipsCarousel tips={tipsData.tips} />}

      <header className="today-header glass-glow">
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

      {challengesData && (
        <DailyChallengesCard
          challenges={challengesData.challenges}
          onComplete={handleCompleteChallenge}
          completingId={completingChallengeId}
        />
      )}

      <div className="today-add-task">
        {showAddTask ? (
          <CustomTaskForm
            onSubmit={handleCreateCustomTask}
            onCancel={() => setShowAddTask(false)}
            isSubmitting={createCustomTask.isPending}
          />
        ) : (
          <button type="button" className="btn btn--secondary" onClick={() => setShowAddTask(true)}>
            + Add task
          </button>
        )}
      </div>

      <TaskList
        tasks={tasks}
        onComplete={(id) => handleStatusChange(id, "COMPLETED")}
        onSkip={(id) => handleStatusChange(id, "SKIPPED")}
        onSwap={handleSwap}
        updatingTaskId={updatingTaskId}
        swappingTaskId={swappingTaskId}
      />
    </div>
  );
}
