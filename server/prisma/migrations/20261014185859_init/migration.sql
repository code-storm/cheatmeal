-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PregnancyProfile" (
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
    CONSTRAINT "PregnancyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FoodAvoidRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodName" TEXT NOT NULL,
    "matchTags" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "minWeek" INTEGER NOT NULL DEFAULT 1,
    "maxWeek" INTEGER NOT NULL DEFAULT 42,
    "severity" TEXT NOT NULL DEFAULT 'avoid',
    "source" TEXT
);

-- CreateTable
CREATE TABLE "ActivityAvoidRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityName" TEXT NOT NULL,
    "matchTags" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "minWeek" INTEGER NOT NULL DEFAULT 1,
    "maxWeek" INTEGER NOT NULL DEFAULT 42,
    "severity" TEXT NOT NULL DEFAULT 'avoid',
    "source" TEXT
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "pregnancyWeekAtGeneration" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyPlanId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    CONSTRAINT "DailyTask_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTask_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealServingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "rotationPoolKey" TEXT NOT NULL,
    "servedDate" TEXT NOT NULL,
    CONSTRAINT "MealServingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MealServingLog_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PregnancyProfile_userId_key" ON "PregnancyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_slug_key" ON "TaskTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_userId_date_key" ON "DailyPlan"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyTask_dailyPlanId_idx" ON "DailyTask"("dailyPlanId");

-- CreateIndex
CREATE INDEX "MealServingLog_userId_rotationPoolKey_servedDate_idx" ON "MealServingLog"("userId", "rotationPoolKey", "servedDate");
