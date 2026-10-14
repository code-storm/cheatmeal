// Shared types mirroring the backend API contract.

export interface User {
  id: string;
  email: string;
}

export type TaskType = "MEAL" | "EXERCISE" | "HABIT" | "GROOMING";

export type TaskStatus = "PENDING" | "COMPLETED" | "SKIPPED";

export interface Task {
  id: string;
  type: TaskType;
  mealSlot: string | null;
  name: string;
  description: string;
  scheduledTime: string; // "HH:mm"
  status: TaskStatus;
  completedAt?: string | null;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  pregnancyWeek: number;
  tasks: Task[];
}

export interface HistoryDay {
  date: string;
  completedCount: number;
  totalCount: number;
  skippedCount: number;
}

export interface HistoryResponse {
  days: HistoryDay[];
}

export interface Profile {
  age: number;
  prePregnancyWeightKg: number;
  heightCm: number | null;
  currentWeightKg: number | null;
  weekAtSignup: number;
  lmpDate: string | null;
}

export type Trimester = 1 | 2 | 3;

export interface ProfileResponse {
  profile: Profile;
  currentPregnancyWeek: number;
  trimester: Trimester;
}

export interface OnboardingPayload {
  age: number;
  prePregnancyWeightKg: number;
  heightCm?: number;
  currentPregnancyWeek: number;
}
