import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthCredentials } from "../api/authApi";
import { AUTH_ME_QUERY_KEY } from "../context/authQueryKey";

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authApi.signup(credentials),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY }),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authApi.login(credentials),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
