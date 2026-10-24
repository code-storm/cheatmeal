import { useContext } from "react";
import { AdminAuthContext, type AdminAuthContextValue } from "./adminAuthContextObject";

export function useAdminAuthContext(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuthContext must be used within an AdminAuthProvider");
  }
  return ctx;
}
