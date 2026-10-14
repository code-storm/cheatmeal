import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../api/client";
import { authApi } from "../api/authApi";
import { AUTH_ME_QUERY_KEY } from "./authQueryKey";
import { AuthContext, type AuthContextValue } from "./authContextObject";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? null,
      hasProfile: data?.hasProfile ?? false,
      isLoading: isLoading || (isFetching && data === undefined),
      isAuthenticated: Boolean(data?.user),
      refetch: async () => {
        await refetch();
      },
    }),
    [data, isLoading, isFetching, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
