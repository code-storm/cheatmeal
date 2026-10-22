-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyPlanId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "proteinG" REAL NOT NULL DEFAULT 0,
    "carbsG" REAL NOT NULL DEFAULT 0,
    "fatG" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DailyTask_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTask_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyTask" ("completedAt", "dailyPlanId", "id", "scheduledTime", "status", "taskTemplateId") SELECT "completedAt", "dailyPlanId", "id", "scheduledTime", "status", "taskTemplateId" FROM "DailyTask";
DROP TABLE "DailyTask";
ALTER TABLE "new_DailyTask" RENAME TO "DailyTask";
CREATE INDEX "DailyTask_dailyPlanId_idx" ON "DailyTask"("dailyPlanId");
CREATE TABLE "new_PregnancyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "prePregnancyWeightKg" REAL NOT NULL,
    "heightCm" REAL,
    "weekAtSignup" INTEGER NOT NULL,
    "signupDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lmpDate" DATETIME NOT NULL,
    "currentWeightKg" REAL,
    "updatedAt" DATETIME NOT NULL,
    "dietPreference" TEXT NOT NULL DEFAULT 'NO_RESTRICTION',
    CONSTRAINT "PregnancyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PregnancyProfile" ("age", "currentWeightKg", "heightCm", "id", "lmpDate", "prePregnancyWeightKg", "signupDate", "updatedAt", "userId", "weekAtSignup") SELECT "age", "currentWeightKg", "heightCm", "id", "lmpDate", "prePregnancyWeightKg", "signupDate", "updatedAt", "userId", "weekAtSignup" FROM "PregnancyProfile";
DROP TABLE "PregnancyProfile";
ALTER TABLE "new_PregnancyProfile" RENAME TO "PregnancyProfile";
CREATE UNIQUE INDEX "PregnancyProfile_userId_key" ON "PregnancyProfile"("userId");
CREATE TABLE "new_TaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mealSlot" TEXT,
    "defaultTime" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT,
    "minWeek" INTEGER NOT NULL,
    "maxWeek" INTEGER NOT NULL,
    "nutrientTags" TEXT NOT NULL,
    "rotationPoolKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dietType" TEXT NOT NULL DEFAULT 'VEGETARIAN',
    "calories" INTEGER NOT NULL DEFAULT 0,
    "proteinG" REAL NOT NULL DEFAULT 0,
    "carbsG" REAL NOT NULL DEFAULT 0,
    "fatG" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_TaskTemplate" ("createdAt", "defaultTime", "description", "id", "instructions", "isActive", "maxWeek", "mealSlot", "minWeek", "name", "nutrientTags", "rotationPoolKey", "slug", "type") SELECT "createdAt", "defaultTime", "description", "id", "instructions", "isActive", "maxWeek", "mealSlot", "minWeek", "name", "nutrientTags", "rotationPoolKey", "slug", "type" FROM "TaskTemplate";
DROP TABLE "TaskTemplate";
ALTER TABLE "new_TaskTemplate" RENAME TO "TaskTemplate";
CREATE UNIQUE INDEX "TaskTemplate_slug_key" ON "TaskTemplate"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
