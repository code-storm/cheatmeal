// Mirrors client/src/lib/authToken.ts, with a DISTINCT localStorage key so
// a regular-user token and an admin token can coexist in the same browser
// (e.g. an admin who is also testing the consumer app) without clobbering
// each other, and so clearing one never affects the other.
const ADMIN_TOKEN_KEY = "cheatmeal_admin_auth_token";

export function getAdminAuthToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminAuthToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminAuthToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
