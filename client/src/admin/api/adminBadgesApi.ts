import { adminApiRequest } from "./adminClient";

// Mirrors server/src/services/badges.service.ts's BADGE_CRITERIA_KEYS -
// the exhaustive, exact set isCriteriaMet's switch handles. Any other
// value leaves a badge permanently un-awardable, so the admin form
// presents this as a closed dropdown, never free text.
export const ADMIN_BADGE_CRITERIA_KEYS = [
  "FIRST_TASK",
  "PERFECT_DAY",
  "STREAK_7",
  "STREAK_30",
  "CHALLENGE_ROOKIE",
  "CHALLENGE_CHAMPION",
  "FIRST_REWARD_UNLOCK",
  "CUSTOM_CREATOR",
  "CENTURION",
  "TRIMESTER_2_REACHED",
  "WEEK_20_HALFWAY",
  "TRIMESTER_3_REACHED",
  "FULL_TERM_REACHED",
  "EVENT_FIRST_ITEM",
  "EVENT_SET_COMPLETE",
] as const;
export type AdminBadgeCriteriaKey = (typeof ADMIN_BADGE_CRITERIA_KEYS)[number];

export interface AdminBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteriaKey: AdminBadgeCriteriaKey;
  isActive: boolean;
  imageUrl: string | null;
  eventId: string | null;
  eventSlug: string | null;
  eventName: string | null;
}

export interface AdminBadgeInput {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteriaKey: AdminBadgeCriteriaKey;
  imageUrl: string | null;
  eventId: string | null;
  isActive: boolean;
}

export const adminBadgesApi = {
  list: () => adminApiRequest<{ badges: AdminBadge[] }>("/api/admin/badges"),

  get: (id: string) => adminApiRequest<{ badge: AdminBadge }>(`/api/admin/badges/${id}`),

  create: (data: AdminBadgeInput) =>
    adminApiRequest<{ badge: { id: string; slug: string } }>("/api/admin/badges", { method: "POST", body: data }),

  update: (id: string, data: Partial<AdminBadgeInput>) =>
    adminApiRequest<{ badge: { id: string; slug: string } }>(`/api/admin/badges/${id}`, {
      method: "PATCH",
      body: data,
    }),
};
