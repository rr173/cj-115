-- CreateTable
CREATE TABLE "WaterSourceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "flow" REAL NOT NULL,
    "reportedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterSourceReport_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DroughtAlertEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "previousLevel" TEXT,
    "supplyDemandRatio" REAL NOT NULL,
    "actualFlow" REAL NOT NULL,
    "demandFlow" REAL NOT NULL,
    "emergencyLevel" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChannelTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceChannelId" TEXT NOT NULL,
    "targetChannelId" TEXT NOT NULL,
    "transferredCapacity" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" DATETIME,
    CONSTRAINT "ChannelTransfer_sourceChannelId_fkey" FOREIGN KEY ("sourceChannelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChannelTransfer_targetChannelId_fkey" FOREIGN KEY ("targetChannelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplyDemandSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hour" DATETIME NOT NULL,
    "actualFlow" REAL NOT NULL,
    "demandFlow" REAL NOT NULL,
    "supplyDemandRatio" REAL NOT NULL,
    "droughtStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaterAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "flow" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "droughtStatus" TEXT NOT NULL DEFAULT 'NORMAL',
    "originalFlow" REAL,
    CONSTRAINT "WaterAllocation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterAllocation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WaterAllocation" ("applicationId", "channelId", "createdAt", "endTime", "flow", "id", "startTime") SELECT "applicationId", "channelId", "createdAt", "endTime", "flow", "id", "startTime" FROM "WaterAllocation";
DROP TABLE "WaterAllocation";
ALTER TABLE "new_WaterAllocation" RENAME TO "WaterAllocation";
CREATE INDEX "WaterAllocation_channelId_startTime_endTime_idx" ON "WaterAllocation"("channelId", "startTime", "endTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "WaterSourceReport_channelId_idx" ON "WaterSourceReport"("channelId");

-- CreateIndex
CREATE INDEX "WaterSourceReport_reportedAt_idx" ON "WaterSourceReport"("reportedAt");

-- CreateIndex
CREATE INDEX "DroughtAlertEvent_level_idx" ON "DroughtAlertEvent"("level");

-- CreateIndex
CREATE INDEX "DroughtAlertEvent_createdAt_idx" ON "DroughtAlertEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ChannelTransfer_sourceChannelId_idx" ON "ChannelTransfer"("sourceChannelId");

-- CreateIndex
CREATE INDEX "ChannelTransfer_targetChannelId_idx" ON "ChannelTransfer"("targetChannelId");

-- CreateIndex
CREATE INDEX "ChannelTransfer_status_idx" ON "ChannelTransfer"("status");

-- CreateIndex
CREATE INDEX "SupplyDemandSnapshot_hour_idx" ON "SupplyDemandSnapshot"("hour");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyDemandSnapshot_hour_key" ON "SupplyDemandSnapshot"("hour");
