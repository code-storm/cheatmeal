import { createContext } from "react";
import type { AdminUser } from "../api/adminAuthApi";

// Deliberately simpler than the regular AuthContextValue - no "hasProfile"
// concept (that's an onboarding idea with no admin equivalent). Admin
// auth state is just authenticated or not.
export interface AdminAuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<unknown>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);
