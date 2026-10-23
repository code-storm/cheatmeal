import { PrismaClient } from "@prisma/client";
import { meals } from "../src/content/meals";
import { exercises } from "../src/content/exercises";
import { habits } from "../src/content/habits";
import { foodAvoidRules, activityAvoidRules } from "../src/content/avoidRules";
import { rewardItems } from "../src/content/rewards";
import { badges } from "../src/content/badges";
import { challengeTemplates } from "../src/content/challenges";
import { events } from "../src/content/events";

const prisma = new PrismaClient();

async function main() {
  const allTaskTemplates = [...meals, ...exercises, ...habits];

  for (const template of allTaskTemplates) {
    await prisma.taskTemplate.upsert({
      where: { slug: template.slug },
      update: {
        type: template.type,
        mealSlot: template.mealSlot ?? null,
        defaultTime: template.defaultTime,
        name: template.name,
        description: template.description,
        instructions: template.instructions ?? null,
        minWeek: template.minWeek,
        maxWeek: template.maxWeek,
        nutrientTags: template.nutrientTags,
        rotationPoolKey: template.rotationPoolKey ?? null,
        isActive: true,
        dietType: template.dietType ?? "VEGETARIAN",
        calories: template.calories ?? 0,
        proteinG: template.proteinG ?? 0,
        carbsG: template.carbsG ?? 0,
        fatG: template.fatG ?? 0,
      },
      create: {
        slug: template.slug,
        type: template.type,
        mealSlot: template.mealSlot ?? null,
        defaultTime: template.defaultTime,
        name: template.name,
        description: template.description,
        instructions: template.instructions ?? null,
        minWeek: template.minWeek,
        maxWeek: template.maxWeek,
        nutrientTags: template.nutrientTags,
        rotationPoolKey: template.rotationPoolKey ?? null,
        dietType: template.dietType ?? "VEGETARIAN",
        calories: template.calories ?? 0,
        proteinG: template.proteinG ?? 0,
        carbsG: template.carbsG ?? 0,
        fatG: template.fatG ?? 0,
      },
    });
  }

  // FoodAvoidRule / ActivityAvoidRule have no natural unique key in the
  // schema; these are small reference tables, so we clear and recreate them
  // on every seed run rather than upserting.
  await prisma.foodAvoidRule.deleteMany();
  await prisma.foodAvoidRule.createMany({
    data: foodAvoidRules.map((rule) => ({
      foodName: rule.foodName,
      matchTags: rule.matchTags,
      reason: rule.reason,
      minWeek: rule.minWeek ?? 1,
      maxWeek: rule.maxWeek ?? 42,
      severity: rule.severity,
      source: rule.source ?? null,
    })),
  });

  await prisma.activityAvoidRule.deleteMany();
  await prisma.activityAvoidRule.createMany({
    data: activityAvoidRules.map((rule) => ({
      activityName: rule.activityName,
      matchTags: rule.matchTags,
      reason: rule.reason,
      minWeek: rule.minWeek ?? 1,
      maxWeek: rule.maxWeek ?? 42,
      severity: rule.severity,
      source: rule.source ?? null,
    })),
  });

  // Events are seeded before rewardItems/badges so their eventSlug ->
  // eventId lookups below resolve to a real row.
  const eventIdBySlug = new Map<string, string>();
  for (const event of events) {
    const row = await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        name: event.name,
        tagline: event.tagline,
        description: event.description,
        sponsorName: event.sponsorName ?? null,
        themeSlug: event.themeSlug,
        heroImageUrl: event.heroImageUrl ?? null,
        cardImageUrl: event.cardImageUrl ?? null,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
        isActive: true,
      },
      create: {
        slug: event.slug,
        name: event.name,
        tagline: event.tagline,
        description: event.description,
        sponsorName: event.sponsorName ?? null,
        themeSlug: event.themeSlug,
        heroImageUrl: event.heroImageUrl ?? null,
        cardImageUrl: event.cardImageUrl ?? null,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
      },
    });
    eventIdBySlug.set(event.slug, row.id);
  }

  for (const item of rewardItems) {
    const eventId = item.eventSlug ? eventIdBySlug.get(item.eventSlug) ?? null : null;
    await prisma.rewardItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        costPoints: item.costPoints,
        icon: item.icon,
        powerKey: item.powerKey ?? null,
        isActive: true,
        availableFromWeek: item.availableFromWeek ?? null,
        availableUntilWeek: item.availableUntilWeek ?? null,
        imageUrl: item.imageUrl ?? null,
        eventId,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        costPoints: item.costPoints,
        icon: item.icon,
        powerKey: item.powerKey ?? null,
        availableFromWeek: item.availableFromWeek ?? null,
        availableUntilWeek: item.availableUntilWeek ?? null,
        imageUrl: item.imageUrl ?? null,
        eventId,
      },
    });
  }

  for (const badge of badges) {
    const eventId = badge.eventSlug ? eventIdBySlug.get(badge.eventSlug) ?? null : null;
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        criteriaKey: badge.criteriaKey,
        isActive: true,
        imageUrl: badge.imageUrl ?? null,
        eventId,
      },
      create: {
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        criteriaKey: badge.criteriaKey,
        imageUrl: badge.imageUrl ?? null,
        eventId,
      },
    });
  }

  for (const template of challengeTemplates) {
    await prisma.dailyChallengeTemplate.upsert({
      where: { slug: template.slug },
      update: {
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        proofType: template.proofType,
        bonusPoints: template.bonusPoints,
        isActive: true,
      },
      create: {
        slug: template.slug,
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        proofType: template.proofType,
        bonusPoints: template.bonusPoints,
      },
    });
  }

  console.log(
    `Seeded ${allTaskTemplates.length} task templates, ${foodAvoidRules.length} food avoid rules, ${activityAvoidRules.length} activity avoid rules, ${events.length} events, ${rewardItems.length} reward items, ${badges.length} badges, ${challengeTemplates.length} daily challenge templates.`
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
