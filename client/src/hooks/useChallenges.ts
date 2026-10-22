import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { challengesApi } from "../api/challengesApi";
import { PROFILE_QUERY_KEY } from "./useProfile";
import { BADGES_QUERY_KEY } from "./useBadges";
import type { TaskStatus } from "../types";

export const CHALLENGES_QUERY_KEY = ["challenges"] as const;

export function useChallenges() {
  return useQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: challengesApi.today,
  });
}

export function useUpdateChallengeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, proofCaption }: { id: string; status: TaskStatus; proofCaption?: string }) =>
      challengesApi.updateInstanceStatus(id, status, proofCaption),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BADGES_QUERY_KEY });
    },
  });
}
