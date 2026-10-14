import { apiRequest } from "./client";
import type { DayPlan, HistoryResponse, Task, TaskStatus } from "../types";

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
    apiRequest<{ task: Pick<Task, "id" | "status" | "completedAt"> }>(
      `/api/plan/task/${taskId}`,
      { method: "PATCH", body: { status } },
    ),
};
