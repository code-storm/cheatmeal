import { apiRequest } from "./client";
import type { BadgesResponse } from "../types";

export const badgesApi = {
  list: () => apiRequest<BadgesResponse>("/api/badges"),
};
