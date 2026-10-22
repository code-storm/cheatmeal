-- AlterTable
ALTER TABLE "RewardItem" ADD COLUMN "availableFromWeek" INTEGER;
ALTER TABLE "RewardItem" ADD COLUMN "availableUntilWeek" INTEGER;

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
    "streakGraceTokens" INTEGER NOT NULL DEFAULT 0,
    "lastGraceGrantDate" TEXT,
    CONSTRAINT "PregnancyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PregnancyProfile" ("activeAvatarSlug", "activeSkinSlug", "age", "currentStreak", "currentWeightKg", "dietPreference", "heightCm", "id", "lastLoginBonusDate", "lastStreakDate", "lmpDate", "longestStreak", "pointsBalance", "prePregnancyWeightKg", "signupDate", "totalPointsEarned", "updatedAt", "userId", "weekAtSignup") SELECT "activeAvatarSlug", "activeSkinSlug", "age", "currentStreak", "currentWeightKg", "dietPreference", "heightCm", "id", "lastLoginBonusDate", "lastStreakDate", "lmpDate", "longestStreak", "pointsBalance", "prePregnancyWeightKg", "signupDate", "totalPointsEarned", "updatedAt", "userId", "weekAtSignup" FROM "PregnancyProfile";
DROP TABLE "PregnancyProfile";
ALTER TABLE "new_PregnancyProfile" RENAME TO "PregnancyProfile";
CREATE UNIQUE INDEX "PregnancyProfile_userId_key" ON "PregnancyProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
