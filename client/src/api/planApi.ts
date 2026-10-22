import { apiRequest } from "./client";
import type {
  DayPlan,
  HistoryResponse,
  SwapTaskResponse,
  TaskStatus,
  TaskStatusUpdateResponse,
} from "../types";

export const planApi = {
  today: () => apiRequest<DayPlan>("/api/plan/today"),

  byDate: (date: string) => apiRequest<DayPlan>(`/api/plan/${date}`),

  history: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiRequest<HistoryResponse>(`/api/plan/history${qs ? `?${qs}` : ""}`);
  },

  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    apiRequest<TaskStatusUpdateResponse>(`/api/plan/task/${taskId}`, {
      method: "PATCH",
      body: { status },
    }),

  swapTask: (taskId: string, options?: { ignoreRecency?: boolean }) =>
    apiRequest<SwapTaskResponse>(`/api/plan/task/${taskId}/swap`, {
      method: "POST",
      body: options?.ignoreRecency ? { ignoreRecency: true } : undefined,
    }),

  tomorrowPreview: () => apiRequest<DayPlan & { preview: true }>("/api/plan/tomorrow-preview"),
};
