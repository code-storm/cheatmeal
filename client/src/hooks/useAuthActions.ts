import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthCredentials } from "../api/authApi";
import { AUTH_ME_QUERY_KEY } from "../context/authQueryKey";
import { setAuthToken, clearAuthToken } from "../lib/authToken";

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authApi.signup(credentials),
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuthToken();
      queryClient.clear();
    },
  });
}
