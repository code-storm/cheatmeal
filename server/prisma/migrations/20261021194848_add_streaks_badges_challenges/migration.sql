-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteriaKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyChallengeTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "bonusPoints" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "DailyChallengeInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "bonusPoints" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofCaption" TEXT,
    "completedAt" DATETIME,
    CONSTRAINT "DailyChallengeInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyChallengeInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DailyChallengeTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" TEXT,
    "lastLoginBonusDate" TEXT,
    CONSTRAINT "PregnancyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PregnancyProfile" ("activeAvatarSlug", "activeSkinSlug", "age", "currentWeightKg", "dietPreference", "heightCm", "id", "lmpDate", "pointsBalance", "prePregnancyWeightKg", "signupDate", "totalPointsEarned", "updatedAt", "userId", "weekAtSignup") SELECT "activeAvatarSlug", "activeSkinSlug", "age", "currentWeightKg", "dietPreference", "heightCm", "id", "lmpDate", "pointsBalance", "prePregnancyWeightKg", "signupDate", "totalPointsEarned", "updatedAt", "userId", "weekAtSignup" FROM "PregnancyProfile";
DROP TABLE "PregnancyProfile";
ALTER TABLE "new_PregnancyProfile" RENAME TO "PregnancyProfile";
CREATE UNIQUE INDEX "PregnancyProfile_userId_key" ON "PregnancyProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeTemplate_slug_key" ON "DailyChallengeTemplate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeInstance_userId_date_difficulty_key" ON "DailyChallengeInstance"("userId", "date", "difficulty");
