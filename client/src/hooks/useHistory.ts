import { useQuery } from "@tanstack/react-query";
import { planApi } from "../api/planApi";

export function useHistory(from?: string, to?: string) {
  return useQuery({
    queryKey: ["plan", "history", from ?? null, to ?? null],
    queryFn: () => planApi.history(from, to),
  });
}

export function useDayPlan(date: string | null) {
  return useQuery({
    queryKey: ["plan", "day", date],
    queryFn: () => planApi.byDate(date as string),
    enabled: Boolean(date),
    retry: false,
  });
}
