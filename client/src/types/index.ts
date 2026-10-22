// Shared types mirroring the backend API contract.

export interface User {
  id: string;
  email: string;
}

export type TaskType = "MEAL" | "EXERCISE" | "HABIT" | "GROOMING";

export type TaskStatus = "PENDING" | "COMPLETED" | "SKIPPED";

export type DietPreference = "VEGETARIAN" | "EGGETARIAN" | "NON_VEGETARIAN" | "NO_RESTRICTION";

export interface Task {
  id: string;
  type: TaskType;
  mealSlot: string | null;
  name: string;
  description: string;
  scheduledTime: string; // "HH:mm"
  status: TaskStatus;
  completedAt?: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  pointsAwarded: number;
  isCustom: boolean;
}

export interface TaskStatusUpdateResponse {
  task: Pick<Task, "id" | "status" | "completedAt" | "pointsAwarded">;
  pointsDelta: number;
  pointsBalance: number;
  newBadges: BadgeDTO[];
  graceTokenConsumed: boolean;
}

export interface MacroTarget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  pregnancyWeek: number;
  macroTarget: MacroTarget;
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
  dietPreference: DietPreference;
  pointsBalance: number;
  totalPointsEarned: number;
  activeSkinSlug: string;
  activeAvatarSlug: string | null;
  currentStreak: number;
  longestStreak: number;
  streakGraceTokens: number;
}

export type Trimester = 1 | 2 | 3;

export interface LevelInfo {
  name: string;
  icon: string;
  index: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number | null;
  totalForNextLevel: number | null;
}

export interface ProfileResponse {
  profile: Profile;
  currentPregnancyWeek: number;
  trimester: Trimester;
  level: LevelInfo;
  loginBonusAwarded?: { points: number };
}

export interface OnboardingPayload {
  age: number;
  prePregnancyWeightKg: number;
  heightCm?: number;
  currentPregnancyWeek: number;
  dietPreference: DietPreference;
}

export interface SwapTaskResponse {
  task: Pick<
    Task,
    "id" | "name" | "description" | "scheduledTime" | "status" | "calories" | "proteinG" | "carbsG" | "fatG"
  >;
}

// --- Rewards / gamification ------------------------------------------------

export type RewardCategory = "SKIN" | "AVATAR" | "POWER";

export type PowerKey = "TOMORROW_PREVIEW" | "FRESH_PICK";

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface RewardItemDTO {
  slug: string;
  name: string;
  description: string;
  category: RewardCategory;
  rarity: Rarity;
  costPoints: number;
  effectiveCostPoints: number;
  featured: boolean;
  icon: string;
  powerKey: PowerKey | null;
  unlocked: boolean;
  purchasable: boolean;
  availableFromWeek: number | null;
  availableUntilWeek: number | null;
}

export interface RewardsResponse {
  pointsBalance: number;
  totalPointsEarned: number;
  activeSkinSlug: string;
  activeAvatarSlug: string | null;
  items: RewardItemDTO[];
}

export interface UnlockRewardResponse {
  pointsBalance: number;
  item: RewardItemDTO;
  newBadges: BadgeDTO[];
}

export interface ActivateRewardResponse {
  profile: Profile;
}

// --- Custom tasks -----------------------------------------------------------

export type CustomTaskRecurrence = "ONE_TIME" | "DAILY";

export interface CustomTask {
  id: string;
  userId: string;
  name: string;
  type: TaskType;
  scheduledTime: string;
  recurrence: CustomTaskRecurrence;
  startDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomTasksResponse {
  customTasks: CustomTask[];
}

export interface CreateCustomTaskPayload {
  name: string;
  type: TaskType;
  scheduledTime: string;
  recurrence: CustomTaskRecurrence;
  startDate?: string;
}

export interface CreateCustomTaskResponse {
  customTask: CustomTask;
  newBadges: BadgeDTO[];
}

// --- Badges ------------------------------------------------------------------

export interface BadgeDTO {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteriaKey?: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
}

export interface BadgesResponse {
  items: BadgeDTO[];
}

// --- Daily challenges ----------------------------------------------------------

export type ChallengeDifficulty = "EASY" | "MODERATE" | "HARD";
export type ChallengeProofType = "CHECKBOX" | "CAPTION";

export interface ChallengeInstance {
  id: string;
  difficulty: ChallengeDifficulty;
  title: string;
  description: string;
  proofType: ChallengeProofType;
  bonusPoints: number;
  status: TaskStatus;
  proofCaption: string | null;
  completedAt: string | null;
}

export interface ChallengesResponse {
  challenges: ChallengeInstance[];
}

export interface ChallengeStatusUpdateResponse {
  challenge: ChallengeInstance;
  pointsBalance: number;
  newBadges: BadgeDTO[];
}

// --- Pregnancy tips ------------------------------------------------------------

export interface TipDTO {
  id: string;
  trimester: Trimester;
  title: string;
  body: string;
  icon: string;
}

export interface TipsResponse {
  tips: TipDTO[];
}
