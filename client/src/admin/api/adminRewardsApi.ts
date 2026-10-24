import { adminApiRequest } from "./adminClient";

export type AdminRewardCategory = "SKIN" | "AVATAR" | "POWER";
export type AdminRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type AdminPowerKey = "TOMORROW_PREVIEW" | "FRESH_PICK";

export interface AdminRewardItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: AdminRewardCategory;
  rarity: AdminRarity;
  costPoints: number;
  icon: string;
  powerKey: AdminPowerKey | null;
  isActive: boolean;
  imageUrl: string | null;
  availableFromWeek: number | null;
  availableUntilWeek: number | null;
  eventId: string | null;
  eventSlug: string | null;
  eventName: string | null;
}

export interface AdminRewardItemInput {
  slug: string;
  name: string;
  description: string;
  category: AdminRewardCategory;
  rarity: AdminRarity;
  costPoints: number;
  icon: string;
  powerKey: AdminPowerKey | null;
  imageUrl: string | null;
  availableFromWeek: number | null;
  availableUntilWeek: number | null;
  eventId: string | null;
  isActive: boolean;
}

export const adminRewardsApi = {
  list: () => adminApiRequest<{ items: AdminRewardItem[] }>("/api/admin/rewards"),

  get: (id: string) => adminApiRequest<{ item: AdminRewardItem }>(`/api/admin/rewards/${id}`),

  create: (data: AdminRewardItemInput) =>
    adminApiRequest<{ item: { id: string; slug: string } }>("/api/admin/rewards", { method: "POST", body: data }),

  update: (id: string, data: Partial<AdminRewardItemInput>) =>
    adminApiRequest<{ item: { id: string; slug: string } }>(`/api/admin/rewards/${id}`, {
      method: "PATCH",
      body: data,
    }),
};
