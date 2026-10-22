import { useQuery } from "@tanstack/react-query";
import { badgesApi } from "../api/badgesApi";

export const BADGES_QUERY_KEY = ["badges"] as const;

export function useBadges() {
  return useQuery({
    queryKey: BADGES_QUERY_KEY,
    queryFn: badgesApi.list,
  });
}
