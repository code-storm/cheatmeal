-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sponsorName" TEXT,
    "themeSlug" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "cardImageUrl" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "pointsEarnedDuringEvent" INTEGER NOT NULL DEFAULT 0,
    "tierReached" INTEGER NOT NULL DEFAULT 0,
    "claimedTiers" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "EventProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventProgress_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteriaKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "eventId" TEXT,
    CONSTRAINT "Badge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Badge" ("criteriaKey", "description", "icon", "id", "isActive", "name", "slug") SELECT "criteriaKey", "description", "icon", "id", "isActive", "name", "slug" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");
CREATE TABLE "new_RewardItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "costPoints" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "powerKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "availableFromWeek" INTEGER,
    "availableUntilWeek" INTEGER,
    "eventId" TEXT,
    CONSTRAINT "RewardItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RewardItem" ("availableFromWeek", "availableUntilWeek", "category", "costPoints", "description", "icon", "id", "isActive", "name", "powerKey", "rarity", "slug") SELECT "availableFromWeek", "availableUntilWeek", "category", "costPoints", "description", "icon", "id", "isActive", "name", "powerKey", "rarity", "slug" FROM "RewardItem";
DROP TABLE "RewardItem";
ALTER TABLE "new_RewardItem" RENAME TO "RewardItem";
CREATE UNIQUE INDEX "RewardItem_slug_key" ON "RewardItem"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_startsAt_endsAt_idx" ON "Event"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventProgress_userId_eventId_key" ON "EventProgress"("userId", "eventId");
