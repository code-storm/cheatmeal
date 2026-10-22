import { apiRequest } from "./client";
import type {
  CreateCustomTaskPayload,
  CreateCustomTaskResponse,
  CustomTask,
  CustomTasksResponse,
  TaskStatus,
  TaskStatusUpdateResponse,
} from "../types";

export const customTasksApi = {
  list: () => apiRequest<CustomTasksResponse>("/api/custom-tasks"),

  create: (payload: CreateCustomTaskPayload) =>
    apiRequest<CreateCustomTaskResponse>("/api/custom-tasks", {
      method: "POST",
      body: payload,
    }),

  setActive: (id: string, isActive: boolean) =>
    apiRequest<{ customTask: CustomTask }>(`/api/custom-tasks/${id}`, {
      method: "PATCH",
      body: { isActive },
    }),

  updateInstanceStatus: (instanceId: string, status: TaskStatus) =>
    apiRequest<TaskStatusUpdateResponse>(`/api/custom-tasks/instance/${instanceId}`, {
      method: "PATCH",
      body: { status },
    }),
};
