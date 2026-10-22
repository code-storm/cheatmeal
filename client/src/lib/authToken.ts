// Auth token storage. localStorage (not sessionStorage) so the JWT's
// 30-day expiry is actually meaningful rather than silently shortened to
// "until the tab closes." The one accepted tradeoff versus the earlier
// httpOnly-cookie scheme: this token is readable by any script running
// on the page (XSS exposure) in exchange for working regardless of
// browser third-party-cookie policy, which the cookie scheme did not.
const TOKEN_KEY = "cheatmeal_auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
