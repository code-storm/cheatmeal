import { apiRequest } from "./client";
import type { TipsResponse } from "../types";

export const tipsApi = {
  today: () => apiRequest<TipsResponse>("/api/tips/today"),
};
