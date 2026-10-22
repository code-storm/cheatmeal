-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_RewardItem" ("category", "costPoints", "description", "icon", "id", "isActive", "name", "powerKey", "slug") SELECT "category", "costPoints", "description", "icon", "id", "isActive", "name", "powerKey", "slug" FROM "RewardItem";
DROP TABLE "RewardItem";
ALTER TABLE "new_RewardItem" RENAME TO "RewardItem";
CREATE UNIQUE INDEX "RewardItem_slug_key" ON "RewardItem"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
