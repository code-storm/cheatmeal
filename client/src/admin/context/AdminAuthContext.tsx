import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../api/adminClient";
import { adminAuthApi } from "../api/adminAuthApi";
import { ADMIN_AUTH_ME_QUERY_KEY } from "./adminAuthQueryKey";
import { AdminAuthContext, type AdminAuthContextValue } from "./adminAuthContextObject";

// Structural clone of ../../context/AuthContext.tsx, pointed at the admin
// auth API/token - kept as a fully separate provider, mounted only around
// the /admin/* route subtree (see App.tsx), so GET /api/admin/auth/me
// never fires for a regular consumer-app visitor who never goes near
// /admin.
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await adminAuthApi.me();
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

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin: data?.admin ?? null,
      isLoading: isLoading || (isFetching && data === undefined),
      isAuthenticated: Boolean(data?.admin),
      refetch: async () => {
        await refetch();
      },
    }),
    [data, isLoading, isFetching, refetch],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
