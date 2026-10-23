import { apiRequest } from "./client";
import type { EventProgressResponse, EventsResponse } from "../types";

export const eventsApi = {
  list: () => apiRequest<EventsResponse>("/api/events"),

  progress: (slug: string) => apiRequest<EventProgressResponse>(`/api/events/${slug}/progress`),
};
