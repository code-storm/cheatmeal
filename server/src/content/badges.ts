export interface BadgeSeed {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteriaKey: string;
  // Real illustrated art, overrides the emoji icon on the client when
  // present. Omitted on every evergreen badge today.
  imageUrl?: string;
  // Crossover-event scoping - see RewardItemSeed.eventSlug in
  // content/rewards.ts for the full explanation. For criteriaKey ===
  // "EVENT_SET_COMPLETE", this field is also the implicit parameter: the
  // badge's own eventId tells checkAndAwardBadges which event's item set
  // must be fully owned.
  eventSlug?: string;
}

export const badges: BadgeSeed[] = [
  {
    slug: "first-task",
    name: "First Step",
    description: "Completed your very first task.",
    icon: "🌱",
    criteriaKey: "FIRST_TASK",
  },
  {
    slug: "perfect-day",
    name: "Perfect Day",
    description: "Completed every task scheduled for a single day.",
    icon: "☀️",
    criteriaKey: "PERFECT_DAY",
  },
  {
    slug: "streak-7",
    name: "Week of Wins",
    description: "Kept a 7-day streak going.",
    icon: "🔥",
    criteriaKey: "STREAK_7",
  },
  {
    slug: "streak-30",
    name: "Unstoppable",
    description: "Kept a 30-day streak going.",
    icon: "🏆",
    criteriaKey: "STREAK_30",
  },
  {
    slug: "challenge-rookie",
    name: "Challenge Rookie",
    description: "Completed your first daily challenge.",
    icon: "🎯",
    criteriaKey: "CHALLENGE_ROOKIE",
  },
  {
    slug: "challenge-champion",
    name: "Challenge Champion",
    description: "Completed 25 daily challenges.",
    icon: "🥇",
    criteriaKey: "CHALLENGE_CHAMPION",
  },
  {
    slug: "first-reward-unlock",
    name: "Treat Yourself",
    description: "Unlocked your first reward.",
    icon: "🎁",
    criteriaKey: "FIRST_REWARD_UNLOCK",
  },
  {
    slug: "custom-creator",
    name: "Custom Creator",
    description: "Created your first custom task.",
    icon: "✏️",
    criteriaKey: "CUSTOM_CREATOR",
  },
  {
    slug: "centurion",
    name: "Centurion",
    description: "Earned 100 lifetime points.",
    icon: "💯",
    criteriaKey: "CENTURION",
  },
  // Journey milestones: tied to the user's real pregnancy week, not points
  // or streaks - the one badge subset that can become true just from the
  // calendar advancing. No points attached, intentionally: crossing a
  // trimester is already meaningful on its own.
  {
    slug: "second-trimester",
    name: "Into the Second Trimester",
    description: "Reached week 14 of your pregnancy.",
    icon: "🌼",
    criteriaKey: "TRIMESTER_2_REACHED",
  },
  {
    slug: "halfway-there",
    name: "Halfway There",
    description: "Reached week 20 - the halfway point.",
    icon: "🌗",
    criteriaKey: "WEEK_20_HALFWAY",
  },
  {
    slug: "third-trimester",
    name: "Into the Third Trimester",
    description: "Reached week 28 of your pregnancy.",
    icon: "🌻",
    criteriaKey: "TRIMESTER_3_REACHED",
  },
  {
    slug: "full-term",
    name: "Full Term",
    description: "Reached week 37 - full term.",
    icon: "🌕",
    criteriaKey: "FULL_TERM_REACHED",
  },
  // --- CheatMeal x Tokidoki (crossover event) -------------------------
  {
    slug: "tokidoki-debut",
    name: "Tokidoki Debut",
    description: "Unlocked your first item from the CheatMeal x Tokidoki drop.",
    icon: "🎉",
    criteriaKey: "EVENT_FIRST_ITEM",
    imageUrl: "/events/tokidoki/badge-debut.png",
    eventSlug: "cheatmeal-x-tokidoki",
  },
  {
    slug: "tokidoki-completionist",
    name: "Tokidoki Completionist",
    description: "Collected every item from the CheatMeal x Tokidoki drop.",
    icon: "🏅",
    criteriaKey: "EVENT_SET_COMPLETE",
    imageUrl: "/events/tokidoki/badge-completionist.png",
    eventSlug: "cheatmeal-x-tokidoki",
  },
];
