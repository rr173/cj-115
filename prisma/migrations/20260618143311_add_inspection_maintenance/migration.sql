-- CreateTable
CREATE TABLE "InspectionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "inspectionDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "problemLevel" TEXT NOT NULL,
    "leakageRate" REAL,
    "siltDepth" REAL,
    "liningDamageLength" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InspectionRecord_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "planStartDate" DATETIME NOT NULL,
    "estimatedDurationDays" INTEGER NOT NULL,
    "crewCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "stopWaterStart" DATETIME NOT NULL,
    "stopWaterEnd" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "startedAt" DATETIME,
    "acceptedAt" DATETIME,
    "closedAt" DATETIME,
    "impactAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceOrder_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "maxFlow" REAL NOT NULL,
    "length" REAL NOT NULL,
    "parentId" TEXT,
    "propagationDelay" INTEGER NOT NULL,
    "inspectionStatus" TEXT NOT NULL DEFAULT 'NORMAL',
    "inspectionCycleDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Channel_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("code", "createdAt", "id", "length", "level", "maxFlow", "name", "parentId", "propagationDelay", "updatedAt") SELECT "code", "createdAt", "id", "length", "level", "maxFlow", "name", "parentId", "propagationDelay", "updatedAt" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_code_key" ON "Channel"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
