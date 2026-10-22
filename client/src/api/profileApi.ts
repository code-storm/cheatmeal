import { apiRequest } from "./client";
import type { DietPreference, OnboardingPayload, Profile, ProfileResponse } from "../types";

export const profileApi = {
  get: () => apiRequest<ProfileResponse>("/api/profile"),

  update: (patch: { currentWeightKg?: number; dietPreference?: DietPreference }) =>
    apiRequest<{ profile: Profile }>("/api/profile", {
      method: "PATCH",
      body: patch,
    }),

  createOnboardingProfile: (payload: OnboardingPayload) =>
    apiRequest<{ profile: Profile }>("/api/onboarding/profile", {
      method: "POST",
      body: payload,
    }),
};
