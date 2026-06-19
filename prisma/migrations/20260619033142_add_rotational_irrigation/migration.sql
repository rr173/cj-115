-- CreateTable
CREATE TABLE "IrrigationSeason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IrrigationRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "waterLimit" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IrrigationRound_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "IrrigationSeason" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IrrigationRoundChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    CONSTRAINT "IrrigationRoundChannel_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "IrrigationRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IrrigationRoundChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "roundId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterApplication_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterApplication_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "IrrigationRound" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaterApplication" ("conflictChannelId", "conflictEndTime", "conflictStartTime", "createdAt", "expectedFlow", "expectedHours", "failReason", "farmerId", "id", "originalTargetDate", "postponeCount", "requestVolume", "status", "submitTime", "targetDate", "updatedAt") SELECT "conflictChannelId", "conflictEndTime", "conflictStartTime", "createdAt", "expectedFlow", "expectedHours", "failReason", "farmerId", "id", "originalTargetDate", "postponeCount", "requestVolume", "status", "submitTime", "targetDate", "updatedAt" FROM "WaterApplication";
DROP TABLE "WaterApplication";
ALTER TABLE "new_WaterApplication" RENAME TO "WaterApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "IrrigationSeason_startDate_endDate_idx" ON "IrrigationSeason"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "IrrigationRound_seasonId_idx" ON "IrrigationRound"("seasonId");

-- CreateIndex
CREATE INDEX "IrrigationRound_startDate_endDate_idx" ON "IrrigationRound"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "IrrigationRoundChannel_channelId_idx" ON "IrrigationRoundChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationRoundChannel_roundId_channelId_key" ON "IrrigationRoundChannel"("roundId", "channelId");
