-- CreateTable
CREATE TABLE "WaterLevelMonitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "installPosition" REAL NOT NULL,
    "normalLower" REAL NOT NULL,
    "normalUpper" REAL NOT NULL,
    "alertOverUpper" REAL NOT NULL,
    "alertBelowLower" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ONLINE',
    "lastReadingAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterLevelMonitor_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLevelReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monitorId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterLevelReading_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "WaterLevelMonitor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "maxOpening" REAL NOT NULL DEFAULT 100,
    "currentOpening" REAL NOT NULL DEFAULT 0,
    "controlMode" TEXT NOT NULL DEFAULT 'AUTO',
    "lastAdjustedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gate_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GateAdjustmentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gateId" TEXT NOT NULL,
    "previousOpening" REAL NOT NULL,
    "targetOpening" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GateAdjustmentLog_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "Gate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLevelAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "monitorId" TEXT,
    "value" REAL,
    "threshold" REAL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "WaterLevelAlert_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterLevelAlert_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "WaterLevelMonitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterLevelMonitor_code_key" ON "WaterLevelMonitor"("code");

-- CreateIndex
CREATE INDEX "WaterLevelMonitor_channelId_idx" ON "WaterLevelMonitor"("channelId");

-- CreateIndex
CREATE INDEX "WaterLevelMonitor_status_idx" ON "WaterLevelMonitor"("status");

-- CreateIndex
CREATE INDEX "WaterLevelReading_monitorId_timestamp_idx" ON "WaterLevelReading"("monitorId", "timestamp");

-- CreateIndex
CREATE INDEX "WaterLevelReading_timestamp_idx" ON "WaterLevelReading"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Gate_code_key" ON "Gate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Gate_channelId_key" ON "Gate"("channelId");

-- CreateIndex
CREATE INDEX "GateAdjustmentLog_gateId_idx" ON "GateAdjustmentLog"("gateId");

-- CreateIndex
CREATE INDEX "GateAdjustmentLog_channelId_idx" ON "GateAdjustmentLog"("channelId");

-- CreateIndex
CREATE INDEX "GateAdjustmentLog_createdAt_idx" ON "GateAdjustmentLog"("createdAt");

-- CreateIndex
CREATE INDEX "WaterLevelAlert_type_idx" ON "WaterLevelAlert"("type");

-- CreateIndex
CREATE INDEX "WaterLevelAlert_channelId_idx" ON "WaterLevelAlert"("channelId");

-- CreateIndex
CREATE INDEX "WaterLevelAlert_isResolved_idx" ON "WaterLevelAlert"("isResolved");

-- CreateIndex
CREATE INDEX "WaterLevelAlert_createdAt_idx" ON "WaterLevelAlert"("createdAt");
