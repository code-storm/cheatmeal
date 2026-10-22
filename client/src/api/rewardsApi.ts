import { apiRequest } from "./client";
import type { ActivateRewardResponse, RewardCategory, RewardsResponse, UnlockRewardResponse } from "../types";

export const rewardsApi = {
  list: () => apiRequest<RewardsResponse>("/api/rewards"),

  unlock: (slug: string) =>
    apiRequest<UnlockRewardResponse>(`/api/rewards/${slug}/unlock`, { method: "POST" }),

  activate: (slug: string) =>
    apiRequest<ActivateRewardResponse>(`/api/rewards/${slug}/activate`, { method: "POST" }),

  deactivate: (category: RewardCategory) =>
    apiRequest<ActivateRewardResponse>("/api/rewards/deactivate", {
      method: "POST",
      body: { category },
    }),
};
