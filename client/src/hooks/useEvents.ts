import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../api/eventsApi";

export const EVENTS_QUERY_KEY = ["events"] as const;

export function useEvents() {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: eventsApi.list,
  });
}

export function useEventProgress(slug: string | undefined) {
  return useQuery({
    queryKey: ["eventProgress", slug] as const,
    queryFn: () => eventsApi.progress(slug as string),
    enabled: !!slug,
  });
}
