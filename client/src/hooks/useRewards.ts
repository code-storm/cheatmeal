import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardsApi } from "../api/rewardsApi";
import { PROFILE_QUERY_KEY } from "./useProfile";
import { BADGES_QUERY_KEY } from "./useBadges";
import { useUnlockCelebration } from "./UnlockCelebrationContext";
import type { RewardCategory, UnlockRewardResponse } from "../types";

export const REWARDS_QUERY_KEY = ["rewards"] as const;

export function useRewards() {
  return useQuery({
    queryKey: REWARDS_QUERY_KEY,
    queryFn: rewardsApi.list,
  });
}

export function useUnlockReward() {
  const queryClient = useQueryClient();
  const { celebrate } = useUnlockCelebration();

  return useMutation({
    mutationFn: (slug: string) => rewardsApi.unlock(slug),
    onSuccess: (data: UnlockRewardResponse) => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
      if (data.item.category === "SKIN") {
        celebrate(data.item.slug);
      }
    },
  });
}

export function useActivateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => rewardsApi.activate(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}

export function useDeactivateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: RewardCategory) => rewardsApi.deactivate(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REWARDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
