import { useQuery } from "@tanstack/react-query";
import { tipsApi } from "../api/tipsApi";

export const TIPS_QUERY_KEY = ["tips"] as const;

export function useTips() {
  return useQuery({
    queryKey: TIPS_QUERY_KEY,
    queryFn: tipsApi.today,
  });
}
