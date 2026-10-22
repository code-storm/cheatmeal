import { apiRequest } from "./client";
import type { ChallengeStatusUpdateResponse, ChallengesResponse, TaskStatus } from "../types";

export const challengesApi = {
  today: () => apiRequest<ChallengesResponse>("/api/challenges/today"),

  updateInstanceStatus: (id: string, status: TaskStatus, proofCaption?: string) =>
    apiRequest<ChallengeStatusUpdateResponse>(`/api/challenges/instance/${id}`, {
      method: "PATCH",
      body: { status, ...(proofCaption !== undefined ? { proofCaption } : {}) },
    }),
};
