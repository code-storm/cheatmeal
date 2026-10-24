import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAuthApi, type AdminCredentials } from "../api/adminAuthApi";
import { ADMIN_AUTH_ME_QUERY_KEY } from "../context/adminAuthQueryKey";
import { setAdminAuthToken, clearAdminAuthToken } from "../lib/adminAuthToken";

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: AdminCredentials) => adminAuthApi.login(credentials),
    onSuccess: (data) => {
      setAdminAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: ADMIN_AUTH_ME_QUERY_KEY });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminAuthApi.logout(),
    onSuccess: () => {
      clearAdminAuthToken();
      queryClient.invalidateQueries({ queryKey: ADMIN_AUTH_ME_QUERY_KEY });
    },
  });
}
