import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FullPageLoadingState } from "./LoadingState";

/**
 * Wrap routes that require the visitor to be logged in AND have completed
 * onboarding (profile created). Redirects to /login or /onboarding as
 * appropriate. This covers TodayPage, HistoryPage, ProfilePage.
 */
export function RequireAuthAndProfile({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, hasProfile } = useAuth();

  if (isLoading) return <FullPageLoadingState label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasProfile) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

/**
 * Wrap the /onboarding route: requires login, but if a profile already
 * exists, bounce to the dashboard instead of letting them re-onboard.
 */
export function RequireAuthNoProfile({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, hasProfile } = useAuth();

  if (isLoading) return <FullPageLoadingState label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hasProfile) return <Navigate to="/" replace />;

  return <>{children}</>;
}

/**
 * Wrap the /login and /signup routes: if already fully set up, skip
 * straight past the auth forms to where the user belongs.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, hasProfile } = useAuth();

  if (isLoading) return <FullPageLoadingState label="Loading..." />;
  if (isAuthenticated) {
    return <Navigate to={hasProfile ? "/" : "/onboarding"} replace />;
  }

  return <>{children}</>;
}
