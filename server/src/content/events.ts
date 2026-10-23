export interface EventTierSeed {
  tier: number;
  pointsRequired: number; // cumulative, within pointsEarnedDuringEvent
  rewardItemSlug: string; // the RewardItem this tier's threshold grants
}

export interface EventSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sponsorName?: string;
  themeSlug: string;
  heroImageUrl?: string;
  cardImageUrl?: string;
  startsAt: string; // ISO 8601, parsed with `new Date(...)` at seed time
  endsAt: string;
  tiers: EventTierSeed[];
}

export const events: EventSeed[] = [
  {
    slug: "cheatmeal-x-tokidoki",
    name: "CheatMeal x Tokidoki",
    tagline: "A playful pop-art drop, here for a limited time.",
    description:
      "A limited-time collaboration bringing Tokidoki's signature pop-art characters into CheatMeal - exclusive skins, an avatar, and a completionist badge, available only while the drop is live.",
    sponsorName: "Tokidoki",
    themeSlug: "tokidoki",
    // The full sprite sheet (client/public/events/tokidoki/sprite.png) is
    // used as-is for the hero/card banners - it's already a colorful,
    // full-canvas collage, unlike the per-item images below which crop
    // one character out of it into a square thumbnail (see
    // utils/spriteImage.ts on the client).
    heroImageUrl: "/events/tokidoki/sprite.png",
    cardImageUrl: "/events/tokidoki/sprite.png",
    startsAt: "2026-11-15T00:00:00Z",
    endsAt: "2026-12-15T00:00:00Z",
    // Each tier grants a RewardItem (via UserReward) on crossing its
    // cumulative points threshold - see creditEventProgress in
    // points.service.ts. The two Tokidoki badges (content/badges.ts) are
    // NOT tier rewards: they're granted separately and automatically by
    // the ordinary badge-criteria system (EVENT_FIRST_ITEM/
    // EVENT_SET_COMPLETE) once the right RewardItems are owned, so they
    // never appear in this list. skin-tokidoki-cactus is intentionally
    // left out of the tier ladder too - it stays an ordinary
    // points-purchasable catalog item, not a tier-gated one.
    tiers: [
      { tier: 1, pointsRequired: 50, rewardItemSlug: "avatar-tokidoki-mascot" },
      { tier: 2, pointsRequired: 150, rewardItemSlug: "power-tokidoki-fresh-pick" },
      { tier: 3, pointsRequired: 350, rewardItemSlug: "skin-tokidoki-pastel" },
      { tier: 4, pointsRequired: 600, rewardItemSlug: "skin-tokidoki-neon" },
    ],
  },
];
