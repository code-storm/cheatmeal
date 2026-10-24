import { adminApiRequest } from "./adminClient";

export interface AdminEventTier {
  id: string;
  tier: number;
  pointsRequired: number;
  rewardItemId: string;
  rewardItemSlug: string;
  rewardItemName: string;
}

export interface AdminEvent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sponsorName: string | null;
  themeSlug: string;
  heroImageUrl: string | null;
  cardImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  stage: "UPCOMING" | "ACTIVE" | "ENDING_SOON" | "RETIRED";
  tiers: AdminEventTier[];
}

export interface AdminEventInput {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sponsorName: string | null;
  themeSlug: string;
  heroImageUrl: string | null;
  cardImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export const adminEventsApi = {
  list: () => adminApiRequest<{ events: AdminEvent[] }>("/api/admin/events"),

  get: (id: string) => adminApiRequest<{ event: AdminEvent }>(`/api/admin/events/${id}`),

  create: (data: AdminEventInput) =>
    adminApiRequest<{ event: { id: string; slug: string } }>("/api/admin/events", { method: "POST", body: data }),

  update: (id: string, data: Partial<AdminEventInput>) =>
    adminApiRequest<{ event: { id: string; slug: string } }>(`/api/admin/events/${id}`, { method: "PATCH", body: data }),

  addTier: (eventId: string, data: { tier: number; pointsRequired: number; rewardItemId: string }) =>
    adminApiRequest<{ tier: AdminEventTier }>(`/api/admin/events/${eventId}/tiers`, { method: "POST", body: data }),

  updateTier: (eventId: string, tierId: string, data: { pointsRequired?: number; rewardItemId?: string }) =>
    adminApiRequest<{ tier: AdminEventTier }>(`/api/admin/events/${eventId}/tiers/${tierId}`, {
      method: "PATCH",
      body: data,
    }),

  deleteTier: (eventId: string, tierId: string) =>
    adminApiRequest<{ ok: true }>(`/api/admin/events/${eventId}/tiers/${tierId}`, { method: "DELETE" }),
};
