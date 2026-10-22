export interface LevelTier {
  name: string;
  icon: string;
  minPoints: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { name: "Seed", icon: "🌰", minPoints: 0 },
  { name: "Sprout", icon: "🌱", minPoints: 100 },
  { name: "Bloom", icon: "🌸", minPoints: 400 },
  { name: "Glow", icon: "✨", minPoints: 900 },
  { name: "Radiant", icon: "🌟", minPoints: 1800 },
  { name: "Luminous", icon: "🔮", minPoints: 3200 },
];

export interface LevelInfo {
  name: string;
  icon: string;
  index: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number | null;
  totalForNextLevel: number | null;
}

export function levelForPoints(totalPointsEarned: number): LevelInfo {
  let currentIndex = 0;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (totalPointsEarned >= LEVEL_TIERS[i].minPoints) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const current = LEVEL_TIERS[currentIndex];
  const next = LEVEL_TIERS[currentIndex + 1] ?? null;

  return {
    name: current.name,
    icon: current.icon,
    index: currentIndex,
    pointsIntoLevel: totalPointsEarned - current.minPoints,
    pointsForNextLevel: next ? next.minPoints - current.minPoints : null,
    totalForNextLevel: next ? next.minPoints : null,
  };
}
