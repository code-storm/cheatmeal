import { apiRequest } from "./client";
import type { User } from "../types";

export interface MeResponse {
  user: User;
  hasProfile: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export const authApi = {
  me: () => apiRequest<MeResponse>("/api/auth/me"),

  signup: (credentials: AuthCredentials) =>
    apiRequest<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: credentials,
    }),

  login: (credentials: AuthCredentials) =>
    apiRequest<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: credentials,
    }),

  logout: () =>
    apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" }),
};
