import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customTasksApi } from "../api/customTasksApi";
import { TODAY_PLAN_QUERY_KEY } from "./useTodayPlan";
import { PROFILE_QUERY_KEY } from "./useProfile";
import { BADGES_QUERY_KEY } from "./useBadges";
import type { CreateCustomTaskPayload, TaskStatus, TaskStatusUpdateResponse } from "../types";

export const CUSTOM_TASKS_QUERY_KEY = ["custom-tasks"] as const;

export function useCustomTasks() {
  return useQuery({
    queryKey: CUSTOM_TASKS_QUERY_KEY,
    queryFn: customTasksApi.list,
  });
}

export function useCreateCustomTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomTaskPayload) => customTasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TODAY_PLAN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}

export function useSetCustomTaskActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      customTasksApi.setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomTaskInstanceStatus() {
  const queryClient = useQueryClient();

  return useMutation<TaskStatusUpdateResponse, Error, { instanceId: string; status: TaskStatus }>({
    mutationFn: ({ instanceId, status }) => customTasksApi.updateInstanceStatus(instanceId, status),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODAY_PLAN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["plan", "history"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}
