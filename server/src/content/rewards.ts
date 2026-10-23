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
  // Real illustrated art (overrides the emoji icon/CSS swatch on the
  // client when present). Omitted on every evergreen item today.
  imageUrl?: string;
  // Crossover-event scoping: resolved to the real Event row's id by slug
  // lookup at seed time (same string-key indirection TaskTemplate's
  // rotationPoolKey already uses) - see content/events.ts and seed.ts.
  eventSlug?: string;
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

  // --- CheatMeal x Tokidoki (crossover event) -------------------------
  // All items below are scoped to the "cheatmeal-x-tokidoki" Event
  // (content/events.ts) via eventSlug - only newly-purchasable while that
  // event is ACTIVE/ENDING_SOON (see isPurchasableForEvent in
  // rewards.routes.ts); ownership never expires once bought, same rule as
  // the pregnancy-week scarcity items above. The 4 tier-ladder items
  // (avatar-tokidoki-mascot, skin-tokidoki-pastel, skin-tokidoki-neon,
  // badge-tokidoki-completionist's underlying badge) are also granted
  // automatically on crossing the event's points thresholds - see
  // content/events.ts's `tiers` and points.service.ts.
  {
    slug: "avatar-tokidoki-mascot",
    name: "Tokidoki Mascot",
    description: "A pop-art cactus friend, straight from the Tokidoki universe.",
    category: "AVATAR",
    rarity: "COMMON",
    costPoints: 80,
    icon: "🌵",
    imageUrl: "/events/tokidoki/avatar-mascot.webp",
    eventSlug: "cheatmeal-x-tokidoki",
  },
  {
    // Slug kept stable across the Cactus Friends -> Ciao Ciao retheme
    // (matches the pattern already used elsewhere in this file, e.g.
    // the original 3 evergreen skins keeping their slugs through
    // earlier renames) so no already-unlocked UserReward row is
    // orphaned by a content-only change.
    slug: "skin-tokidoki-cactus",
    name: "Tokidoki Ciao Ciao",
    description: "A soft pink diagonal-stripe pattern with Ciao Ciao and friends scattered across the screen.",
    category: "SKIN",
    rarity: "RARE",
    costPoints: 180,
    icon: "💗",
    imageUrl: "/events/tokidoki/skin-ciaociao-bg.webp",
    eventSlug: "cheatmeal-x-tokidoki",
  },
  {
    slug: "skin-tokidoki-pastel",
    name: "Tokidoki Pastel Dream",
    description: "A dense, candy-colored pop-art collage filling the screen.",
    category: "SKIN",
    rarity: "EPIC",
    costPoints: 260,
    icon: "☁️",
    imageUrl: "/events/tokidoki/skin-pastel-bg.webp",
    eventSlug: "cheatmeal-x-tokidoki",
  },
  {
    slug: "skin-tokidoki-neon",
    name: "Tokidoki Neon Pop",
    description: "A neon festival night sky, fireworks and the full crew drifting by.",
    category: "SKIN",
    rarity: "LEGENDARY",
    costPoints: 420,
    icon: "🎆",
    imageUrl: "/events/tokidoki/skin-neon-bg.webp",
    eventSlug: "cheatmeal-x-tokidoki",
  },
  {
    slug: "power-tokidoki-fresh-pick",
    name: "Tokidoki Fresh Pick",
    description: "A limited-edition reskin of Fresh Pick - re-roll a meal ignoring the 7-day recency rule.",
    category: "POWER",
    rarity: "RARE",
    costPoints: 220,
    icon: "🎲",
    powerKey: "FRESH_PICK",
    imageUrl: "/events/tokidoki/power-fresh-pick.jpeg",
    eventSlug: "cheatmeal-x-tokidoki",
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
