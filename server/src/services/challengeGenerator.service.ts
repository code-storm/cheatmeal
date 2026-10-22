import { prisma } from "../lib/prisma";
import type { ChallengeDifficulty } from "../lib/enums";
import { CHALLENGE_DIFFICULTIES } from "../lib/enums";

export interface ChallengeInstanceDTO {
  id: string;
  difficulty: ChallengeDifficulty;
  title: string;
  description: string;
  proofType: string;
  bonusPoints: number;
  status: string;
  proofCaption: string | null;
  completedAt: string | null;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Ensures exactly one DailyChallengeInstance per difficulty exists for the
 * given user+date, creating (and randomly picking, then snapshotting) any
 * that are missing. Safe to call repeatedly - existing instances are
 * returned as-is (same idempotent-upsert shape as the meal plan generator).
 */
export async function getOrCreateDailyChallenges(userId: string, dateStr: string): Promise<ChallengeInstanceDTO[]> {
  const existing = await prisma.dailyChallengeInstance.findMany({
    where: { userId, date: dateStr },
  });
  const existingByDifficulty = new Map(existing.map((e) => [e.difficulty, e]));

  const missingDifficulties = CHALLENGE_DIFFICULTIES.filter((d) => !existingByDifficulty.has(d));

  if (missingDifficulties.length > 0) {
    const templatesByDifficulty = await prisma.dailyChallengeTemplate.findMany({
      where: { isActive: true, difficulty: { in: missingDifficulties } },
    });

    for (const difficulty of missingDifficulties) {
      const pool = templatesByDifficulty.filter((t) => t.difficulty === difficulty);
      if (pool.length === 0) continue;
      const template = pickRandom(pool);

      try {
        const created = await prisma.dailyChallengeInstance.create({
          data: {
            userId,
            templateId: template.id,
            date: dateStr,
            difficulty: template.difficulty,
            title: template.title,
            description: template.description,
            proofType: template.proofType,
            bonusPoints: template.bonusPoints,
          },
        });
        existingByDifficulty.set(difficulty, created);
      } catch (err) {
        // Unique constraint race (concurrent request already created it) -
        // re-fetch rather than erroring.
        const refetched = await prisma.dailyChallengeInstance.findUnique({
          where: { userId_date_difficulty: { userId, date: dateStr, difficulty } },
        });
        if (refetched) existingByDifficulty.set(difficulty, refetched);
        else throw err;
      }
    }
  }

  return Array.from(existingByDifficulty.values())
    .sort((a, b) => CHALLENGE_DIFFICULTIES.indexOf(a.difficulty as ChallengeDifficulty) - CHALLENGE_DIFFICULTIES.indexOf(b.difficulty as ChallengeDifficulty))
    .map((instance) => ({
      id: instance.id,
      difficulty: instance.difficulty as ChallengeDifficulty,
      title: instance.title,
      description: instance.description,
      proofType: instance.proofType,
      bonusPoints: instance.bonusPoints,
      status: instance.status,
      proofCaption: instance.proofCaption,
      completedAt: instance.completedAt ? instance.completedAt.toISOString() : null,
    }));
}
