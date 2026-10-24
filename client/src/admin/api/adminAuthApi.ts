import { adminApiRequest } from "./adminClient";

export interface AdminUser {
  id: string;
  email: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export const adminAuthApi = {
  me: () => adminApiRequest<{ admin: AdminUser }>("/api/admin/auth/me"),

  login: (credentials: AdminCredentials) =>
    adminApiRequest<{ admin: AdminUser; token: string }>("/api/admin/auth/login", {
      method: "POST",
      body: credentials,
    }),

  logout: () => adminApiRequest<{ ok: true }>("/api/admin/auth/logout", { method: "POST" }),
};
