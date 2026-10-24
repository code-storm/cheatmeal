import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBadgesApi, type AdminBadgeInput } from "../api/adminBadgesApi";

const ADMIN_BADGES_QUERY_KEY = ["admin", "badges"] as const;

export function useAdminBadges() {
  return useQuery({
    queryKey: ADMIN_BADGES_QUERY_KEY,
    queryFn: adminBadgesApi.list,
  });
}

export function useAdminBadge(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_BADGES_QUERY_KEY, id],
    queryFn: () => adminBadgesApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAdminBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminBadgeInput) => adminBadgesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BADGES_QUERY_KEY });
    },
  });
}

export function useUpdateAdminBadge(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminBadgeInput>) => adminBadgesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BADGES_QUERY_KEY });
    },
  });
}
