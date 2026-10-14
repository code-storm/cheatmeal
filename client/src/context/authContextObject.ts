import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextValue {
  user: User | null;
  hasProfile: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => Promise<unknown>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
