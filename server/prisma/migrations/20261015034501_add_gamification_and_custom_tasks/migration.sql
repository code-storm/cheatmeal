-- CreateTable
CREATE TABLE "CustomTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "recurrence" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomTaskInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customTaskId" TEXT NOT NULL,
    "dailyPlanId" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CustomTaskInstance_customTaskId_fkey" FOREIGN KEY ("customTaskId") REFERENCES "CustomTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomTaskInstance_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "costPoints" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "powerKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardItemId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserReward_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "RewardItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "DailyTask_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTask_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyTask" ("calories", "carbsG", "completedAt", "dailyPlanId", "fatG", "id", "proteinG", "scheduledTime", "status", "taskTemplateId") SELECT "calories", "carbsG", "completedAt", "dailyPlanId", "fatG", "id", "proteinG", "scheduledTime", "status", "taskTemplateId" FROM "DailyTask";
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
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "totalPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "activeSkinSlug" TEXT NOT NULL DEFAULT 'default',
    "activeAvatarSlug" TEXT,
    CONSTRAINT "PregnancyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PregnancyProfile" ("age", "currentWeightKg", "dietPreference", "heightCm", "id", "lmpDate", "prePregnancyWeightKg", "signupDate", "updatedAt", "userId", "weekAtSignup") SELECT "age", "currentWeightKg", "dietPreference", "heightCm", "id", "lmpDate", "prePregnancyWeightKg", "signupDate", "updatedAt", "userId", "weekAtSignup" FROM "PregnancyProfile";
DROP TABLE "PregnancyProfile";
ALTER TABLE "new_PregnancyProfile" RENAME TO "PregnancyProfile";
CREATE UNIQUE INDEX "PregnancyProfile_userId_key" ON "PregnancyProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CustomTaskInstance_customTaskId_dailyPlanId_key" ON "CustomTaskInstance"("customTaskId", "dailyPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardItem_slug_key" ON "RewardItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserReward_userId_rewardItemId_key" ON "UserReward"("userId", "rewardItemId");
