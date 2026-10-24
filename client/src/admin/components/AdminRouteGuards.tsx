import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

// Simpler than the regular app's RouteGuards.tsx - no onboarding-equivalent
// state to gate on, just authenticated or not.

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAdminAuth();

  if (isLoading) return <div className="admin-loading">Checking admin session...</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}

export function RedirectIfAdminAuthenticated({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAdminAuth();

  if (isLoading) return <div className="admin-loading">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
