-- CreateTable
CREATE TABLE "SmartMeter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterNo" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "initialReading" REAL NOT NULL DEFAULT 0,
    "lastReading" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "lastReportedAt" DATETIME,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmartMeter_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "PumpingWell" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterId" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "previousReading" REAL NOT NULL,
    "currentReading" REAL NOT NULL,
    "consumption" REAL NOT NULL,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "abnormalReason" TEXT,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeterReading_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "SmartMeter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeterReading_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "PumpingWell" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeterReading_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectricityQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalKwh" REAL NOT NULL,
    "usedKwh" REAL NOT NULL DEFAULT 0,
    "warningSent" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "operator" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectricityQuota_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectricityExtractionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wellId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "meterReadingId" TEXT NOT NULL,
    "quotaId" TEXT,
    "consumptionKwh" REAL NOT NULL,
    "waterVolume" REAL NOT NULL,
    "coefficient" REAL NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectricityExtractionRecord_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "PumpingWell" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ElectricityExtractionRecord_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ElectricityExtractionRecord_meterReadingId_fkey" FOREIGN KEY ("meterReadingId") REFERENCES "MeterReading" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ElectricityExtractionRecord_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "ElectricityQuota" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeterAbnormalAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meterId" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "previousReading" REAL NOT NULL,
    "currentReading" REAL NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "newBaselineReading" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeterAbnormalAlert_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "SmartMeter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PumpingWell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "ratedFlow" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "associatedChannelId" TEXT,
    "associatedPlot" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "electricityToWaterCoefficient" REAL NOT NULL DEFAULT 5.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PumpingWell_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PumpingWell_associatedChannelId_fkey" FOREIGN KEY ("associatedChannelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PumpingWell" ("associatedChannelId", "associatedPlot", "code", "createdAt", "id", "isActive", "ratedFlow", "unitCost", "updatedAt", "zoneId") SELECT "associatedChannelId", "associatedPlot", "code", "createdAt", "id", "isActive", "ratedFlow", "unitCost", "updatedAt", "zoneId" FROM "PumpingWell";
DROP TABLE "PumpingWell";
ALTER TABLE "new_PumpingWell" RENAME TO "PumpingWell";
CREATE UNIQUE INDEX "PumpingWell_code_key" ON "PumpingWell"("code");
CREATE INDEX "PumpingWell_zoneId_idx" ON "PumpingWell"("zoneId");
CREATE INDEX "PumpingWell_associatedChannelId_idx" ON "PumpingWell"("associatedChannelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SmartMeter_meterNo_key" ON "SmartMeter"("meterNo");

-- CreateIndex
CREATE UNIQUE INDEX "SmartMeter_wellId_key" ON "SmartMeter"("wellId");

-- CreateIndex
CREATE INDEX "SmartMeter_status_idx" ON "SmartMeter"("status");

-- CreateIndex
CREATE INDEX "MeterReading_meterId_idx" ON "MeterReading"("meterId");

-- CreateIndex
CREATE INDEX "MeterReading_wellId_idx" ON "MeterReading"("wellId");

-- CreateIndex
CREATE INDEX "MeterReading_zoneId_idx" ON "MeterReading"("zoneId");

-- CreateIndex
CREATE INDEX "MeterReading_reportedAt_idx" ON "MeterReading"("reportedAt");

-- CreateIndex
CREATE INDEX "ElectricityQuota_zoneId_idx" ON "ElectricityQuota"("zoneId");

-- CreateIndex
CREATE INDEX "ElectricityQuota_startDate_endDate_idx" ON "ElectricityQuota"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ElectricityExtractionRecord_meterReadingId_key" ON "ElectricityExtractionRecord"("meterReadingId");

-- CreateIndex
CREATE INDEX "ElectricityExtractionRecord_wellId_idx" ON "ElectricityExtractionRecord"("wellId");

-- CreateIndex
CREATE INDEX "ElectricityExtractionRecord_zoneId_idx" ON "ElectricityExtractionRecord"("zoneId");

-- CreateIndex
CREATE INDEX "ElectricityExtractionRecord_quotaId_idx" ON "ElectricityExtractionRecord"("quotaId");

-- CreateIndex
CREATE INDEX "ElectricityExtractionRecord_recordedAt_idx" ON "ElectricityExtractionRecord"("recordedAt");

-- CreateIndex
CREATE INDEX "MeterAbnormalAlert_meterId_idx" ON "MeterAbnormalAlert"("meterId");

-- CreateIndex
CREATE INDEX "MeterAbnormalAlert_wellId_idx" ON "MeterAbnormalAlert"("wellId");

-- CreateIndex
CREATE INDEX "MeterAbnormalAlert_isResolved_idx" ON "MeterAbnormalAlert"("isResolved");

-- CreateIndex
CREATE INDEX "MeterAbnormalAlert_createdAt_idx" ON "MeterAbnormalAlert"("createdAt");
