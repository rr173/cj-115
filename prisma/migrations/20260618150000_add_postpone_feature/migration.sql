-- CreateTable
CREATE TABLE "ApplicationPostponeHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "originalDate" DATETIME NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationPostponeHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaterApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "expectedFlow" REAL NOT NULL,
    "expectedHours" REAL NOT NULL,
    "requestVolume" REAL NOT NULL,
    "submitTime" DATETIME NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "originalTargetDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "failReason" TEXT,
    "conflictChannelId" TEXT,
    "conflictStartTime" DATETIME,
    "conflictEndTime" DATETIME,
    "postponeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterApplication_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WaterApplication" ("id", "farmerId", "expectedFlow", "expectedHours", "requestVolume", "submitTime", "targetDate", "originalTargetDate", "status", "failReason", "conflictChannelId", "conflictStartTime", "conflictEndTime", "postponeCount", "createdAt", "updatedAt") 
SELECT "id", "farmerId", "expectedFlow", "expectedHours", "requestVolume", "submitTime", "targetDate", "targetDate" AS "originalTargetDate", "status", "failReason", "conflictChannelId", "conflictStartTime", "conflictEndTime", 0 AS "postponeCount", "createdAt", "updatedAt" FROM "WaterApplication";
DROP TABLE "WaterApplication";
ALTER TABLE "new_WaterApplication" RENAME TO "WaterApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ApplicationPostponeHistory_applicationId_idx" ON "ApplicationPostponeHistory"("applicationId");
CREATE INDEX "ApplicationPostponeHistory_farmerId_idx" ON "ApplicationPostponeHistory"("farmerId");
CREATE INDEX "Notification_farmerId_idx" ON "Notification"("farmerId");
CREATE INDEX "Notification_applicationId_idx" ON "Notification"("applicationId");
