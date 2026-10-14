import { PrismaClient } from "@prisma/client";
import { meals } from "../src/content/meals";
import { exercises } from "../src/content/exercises";
import { habits } from "../src/content/habits";
import { foodAvoidRules, activityAvoidRules } from "../src/content/avoidRules";

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

  console.log(
    `Seeded ${allTaskTemplates.length} task templates, ${foodAvoidRules.length} food avoid rules, ${activityAvoidRules.length} activity avoid rules.`
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
