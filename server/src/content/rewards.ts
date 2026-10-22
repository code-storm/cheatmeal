import type { PowerKey, Rarity, RewardCategory } from "../lib/enums";

export interface RewardItemSeed {
  slug: string;
  name: string;
  description: string;
  category: RewardCategory;
  rarity: Rarity;
  costPoints: number;
  icon: string;
  powerKey?: PowerKey;
  // Pregnancy-week-scoped scarcity: when set, only purchasable while the
  // requesting user's OWN current pregnancy week falls in this range.
  // Omitted (undefined) on every other item - always purchasable.
  availableFromWeek?: number;
  availableUntilWeek?: number;
}

export const rewardItems: RewardItemSeed[] = [
  // Skins - full theme packs (accent + aurora background + glass tint +
  // signature ambient animation) swapped via a data-theme attribute on
  // <body>. Slugs/names/costs of the 3 original skins are kept unchanged
  // so already-unlocked UserReward rows keep resolving - only `rarity` is
  // new on them.
  {
    slug: "morning-bloom",
    name: "Morning Bloom",
    description: "Soft pink and cream light, with petals drifting across the screen.",
    category: "SKIN",
    rarity: "COMMON",
    costPoints: 80,
    icon: "🌷",
  },
  {
    slug: "meadow-fresh",
    name: "Meadow Fresh",
    description: "Fresh green morning light, with fireflies drifting upward.",
    category: "SKIN",
    rarity: "COMMON",
    costPoints: 100,
    icon: "🍃",
  },
  {
    slug: "lavender-dusk",
    name: "Lavender Dusk",
    description: "A calmer plum-and-violet palette, with a slow mist veil drifting through.",
    category: "SKIN",
    rarity: "RARE",
    costPoints: 150,
    icon: "🌙",
  },
  {
    slug: "ocean-calm",
    name: "Ocean Calm",
    description: "Cool blues for a soothing feel, with a gentle wave shimmer.",
    category: "SKIN",
    rarity: "RARE",
    costPoints: 150,
    icon: "🌊",
  },
  {
    slug: "golden-hour",
    name: "Golden Hour",
    description: "Warm amber and gold tones, with slow sweeping light rays.",
    category: "SKIN",
    rarity: "EPIC",
    costPoints: 250,
    icon: "🌅",
  },
  {
    slug: "twilight-aurora",
    name: "Twilight Aurora",
    description: "Deep indigo and teal, with a drifting aurora-ribbon streak of color.",
    category: "SKIN",
    rarity: "EPIC",
    costPoints: 280,
    icon: "🌌",
  },
  {
    slug: "starlit-midnight",
    name: "Starlit Midnight",
    description: "Near-black midnight sky with a silver accent and a field of twinkling stars.",
    category: "SKIN",
    rarity: "LEGENDARY",
    costPoints: 400,
    icon: "🌠",
  },
  {
    slug: "sunset-ember",
    name: "Sunset Ember",
    description: "Saturated orange and magenta, with rising embers and warm light rays.",
    category: "SKIN",
    rarity: "LEGENDARY",
    costPoints: 450,
    icon: "🔥",
  },
  {
    slug: "third-trimester-glow",
    name: "Third Trimester Glow",
    description:
      "A warm, radiant glow exclusive to your third trimester - purchasable only during weeks 28-40 of your own pregnancy, yours to keep forever after.",
    category: "SKIN",
    rarity: "EPIC",
    costPoints: 260,
    icon: "🌟",
    availableFromWeek: 28,
    availableUntilWeek: 40,
  },

  // Avatars - just an icon choice, shown in the header.
  {
    slug: "avatar-blossom",
    name: "Blossom",
    description: "A blooming flower.",
    category: "AVATAR",
    rarity: "COMMON",
    costPoints: 50,
    icon: "🌸",
  },
  {
    slug: "avatar-moon",
    name: "Crescent",
    description: "A crescent moon.",
    category: "AVATAR",
    rarity: "COMMON",
    costPoints: 50,
    icon: "🌙",
  },
  {
    slug: "avatar-sprout",
    name: "Sprout",
    description: "A tiny green sprout.",
    category: "AVATAR",
    rarity: "COMMON",
    costPoints: 100,
    icon: "🌱",
  },
  {
    slug: "avatar-rainbow",
    name: "Rainbow",
    description: "A little rainbow.",
    category: "AVATAR",
    rarity: "COMMON",
    costPoints: 100,
    icon: "🌈",
  },

  // Powers - functional unlocks.
  {
    slug: "power-fresh-pick",
    name: "Fresh Pick",
    description:
      "Re-roll a meal even if you just had something similar - ignores the usual 7-day variety rule for one swap.",
    category: "POWER",
    rarity: "COMMON",
    costPoints: 200,
    icon: "🔄",
    powerKey: "FRESH_PICK",
  },
  {
    slug: "power-tomorrow-preview",
    name: "Tomorrow's Preview",
    description: "Peek at tomorrow's full plan before it's generated.",
    category: "POWER",
    rarity: "COMMON",
    costPoints: 300,
    icon: "🔮",
    powerKey: "TOMORROW_PREVIEW",
  },
];
