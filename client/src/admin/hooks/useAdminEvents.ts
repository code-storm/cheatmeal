import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminEventsApi, type AdminEventInput } from "../api/adminEventsApi";

const ADMIN_EVENTS_QUERY_KEY = ["admin", "events"] as const;

export function useAdminEvents() {
  return useQuery({
    queryKey: ADMIN_EVENTS_QUERY_KEY,
    queryFn: adminEventsApi.list,
  });
}

export function useAdminEvent(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_EVENTS_QUERY_KEY, id],
    queryFn: () => adminEventsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAdminEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminEventInput) => adminEventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
}

export function useUpdateAdminEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminEventInput>) => adminEventsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
}

export function useAddAdminEventTier(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tier: number; pointsRequired: number; rewardItemId: string }) =>
      adminEventsApi.addTier(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
}

export function useUpdateAdminEventTier(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tierId, data }: { tierId: string; data: { pointsRequired?: number; rewardItemId?: string } }) =>
      adminEventsApi.updateTier(eventId, tierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
}

export function useDeleteAdminEventTier(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tierId: string) => adminEventsApi.deleteTier(eventId, tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
    },
  });
}
