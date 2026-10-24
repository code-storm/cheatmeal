import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRewardsApi, type AdminRewardItemInput } from "../api/adminRewardsApi";

const ADMIN_REWARDS_QUERY_KEY = ["admin", "rewards"] as const;

export function useAdminRewards() {
  return useQuery({
    queryKey: ADMIN_REWARDS_QUERY_KEY,
    queryFn: adminRewardsApi.list,
  });
}

export function useAdminReward(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_REWARDS_QUERY_KEY, id],
    queryFn: () => adminRewardsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAdminReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminRewardItemInput) => adminRewardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_REWARDS_QUERY_KEY });
    },
  });
}

export function useUpdateAdminReward(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminRewardItemInput>) => adminRewardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_REWARDS_QUERY_KEY });
    },
  });
}
