import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planApi } from "../api/planApi";
import { PROFILE_QUERY_KEY } from "./useProfile";
import { BADGES_QUERY_KEY } from "./useBadges";
import type { DayPlan, SwapTaskResponse, TaskStatus, TaskStatusUpdateResponse } from "../types";

export const TODAY_PLAN_QUERY_KEY = ["plan", "today"] as const;

export function useTodayPlan() {
  return useQuery({
    queryKey: TODAY_PLAN_QUERY_KEY,
    queryFn: planApi.today,
    retry: (failureCount, error) => {
      // Don't retry the "profile required" case — the caller redirects instead.
      if (error instanceof Error && error.message === "Profile required") return false;
      return failureCount < 2;
    },
  });
}

interface UpdateTaskVars {
  taskId: string;
  status: TaskStatus;
}

interface MutationContext {
  previousPlan: DayPlan | undefined;
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation<TaskStatusUpdateResponse, Error, UpdateTaskVars, MutationContext>({
    mutationFn: ({ taskId, status }) => planApi.updateTaskStatus(taskId, status),

    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: TODAY_PLAN_QUERY_KEY });

      const previousPlan = queryClient.getQueryData<DayPlan>(TODAY_PLAN_QUERY_KEY);

      if (previousPlan) {
        queryClient.setQueryData<DayPlan>(TODAY_PLAN_QUERY_KEY, {
          ...previousPlan,
          tasks: previousPlan.tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          ),
        });
      }

      return { previousPlan };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(TODAY_PLAN_QUERY_KEY, context.previousPlan);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODAY_PLAN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["plan", "history"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}

export function useSwapTask() {
  const queryClient = useQueryClient();

  return useMutation<SwapTaskResponse, Error, { taskId: string; ignoreRecency?: boolean }>({
    mutationFn: ({ taskId, ignoreRecency }) => planApi.swapTask(taskId, { ignoreRecency }),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODAY_PLAN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["plan", "history"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}

export function useTomorrowPreview(enabled: boolean) {
  return useQuery({
    queryKey: ["plan", "tomorrow-preview"],
    queryFn: planApi.tomorrowPreview,
    enabled,
    retry: false,
  });
}
