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
    "roundId" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "emergencyReason" TEXT,
    "emergencyApprovalStatus" TEXT,
    "emergencyApprovedAt" DATETIME,
    "emergencyApprovedBy" TEXT,
    "emergencyRejectReason" TEXT,
    "emergencyTracedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterApplication_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterApplication_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "IrrigationRound" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaterApplication" ("conflictChannelId", "conflictEndTime", "conflictStartTime", "createdAt", "expectedFlow", "expectedHours", "failReason", "farmerId", "id", "originalTargetDate", "postponeCount", "requestVolume", "roundId", "status", "submitTime", "targetDate", "updatedAt") SELECT "conflictChannelId", "conflictEndTime", "conflictStartTime", "createdAt", "expectedFlow", "expectedHours", "failReason", "farmerId", "id", "originalTargetDate", "postponeCount", "requestVolume", "roundId", "status", "submitTime", "targetDate", "updatedAt" FROM "WaterApplication";
DROP TABLE "WaterApplication";
ALTER TABLE "new_WaterApplication" RENAME TO "WaterApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
