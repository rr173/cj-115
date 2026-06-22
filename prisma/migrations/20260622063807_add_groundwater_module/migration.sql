-- CreateTable
CREATE TABLE "IrrigationZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "annualExtractionRedline" REAL NOT NULL,
    "currentWaterLevelDepth" REAL NOT NULL,
    "warningDepth" REAL NOT NULL,
    "recoverableCoefficient" REAL NOT NULL DEFAULT 10000,
    "annualExtractedVolume" REAL NOT NULL DEFAULT 0,
    "lastExtractedAt" DATETIME,
    "isOverExtracted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PumpingWell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "ratedFlow" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "associatedChannelId" TEXT,
    "associatedPlot" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PumpingWell_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PumpingWell_associatedChannelId_fkey" FOREIGN KEY ("associatedChannelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroundwaterExtractionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wellId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "applicationId" TEXT,
    "planId" TEXT,
    "volume" REAL NOT NULL,
    "durationHours" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroundwaterExtractionRecord_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "PumpingWell" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroundwaterExtractionRecord_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroundwaterExtractionRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GroundwaterExtractionRecord_planId_fkey" FOREIGN KEY ("planId") REFERENCES "JointWaterSupplyPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLevelDepthHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "depth" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operator" TEXT,
    "remark" TEXT,
    CONSTRAINT "WaterLevelDepthHistory_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroundwaterAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    CONSTRAINT "GroundwaterAlert_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JointWaterSupplyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "requestedVolume" REAL NOT NULL,
    "canalSuppliedVolume" REAL NOT NULL,
    "wellSuppliedVolume" REAL NOT NULL,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JointWaterSupplyPlan_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JointWaterSupplyPlan_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JointSupplyDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "volume" REAL NOT NULL,
    "durationHours" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JointSupplyDetail_planId_fkey" FOREIGN KEY ("planId") REFERENCES "JointWaterSupplyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JointSupplyDetail_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "PumpingWell" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationZone_code_key" ON "IrrigationZone"("code");

-- CreateIndex
CREATE INDEX "IrrigationZone_code_idx" ON "IrrigationZone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PumpingWell_code_key" ON "PumpingWell"("code");

-- CreateIndex
CREATE INDEX "PumpingWell_zoneId_idx" ON "PumpingWell"("zoneId");

-- CreateIndex
CREATE INDEX "PumpingWell_associatedChannelId_idx" ON "PumpingWell"("associatedChannelId");

-- CreateIndex
CREATE INDEX "GroundwaterExtractionRecord_wellId_idx" ON "GroundwaterExtractionRecord"("wellId");

-- CreateIndex
CREATE INDEX "GroundwaterExtractionRecord_zoneId_idx" ON "GroundwaterExtractionRecord"("zoneId");

-- CreateIndex
CREATE INDEX "GroundwaterExtractionRecord_applicationId_idx" ON "GroundwaterExtractionRecord"("applicationId");

-- CreateIndex
CREATE INDEX "GroundwaterExtractionRecord_recordedAt_idx" ON "GroundwaterExtractionRecord"("recordedAt");

-- CreateIndex
CREATE INDEX "WaterLevelDepthHistory_zoneId_idx" ON "WaterLevelDepthHistory"("zoneId");

-- CreateIndex
CREATE INDEX "WaterLevelDepthHistory_recordedAt_idx" ON "WaterLevelDepthHistory"("recordedAt");

-- CreateIndex
CREATE INDEX "GroundwaterAlert_zoneId_idx" ON "GroundwaterAlert"("zoneId");

-- CreateIndex
CREATE INDEX "GroundwaterAlert_type_idx" ON "GroundwaterAlert"("type");

-- CreateIndex
CREATE INDEX "GroundwaterAlert_isResolved_idx" ON "GroundwaterAlert"("isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "JointWaterSupplyPlan_applicationId_key" ON "JointWaterSupplyPlan"("applicationId");

-- CreateIndex
CREATE INDEX "JointWaterSupplyPlan_zoneId_idx" ON "JointWaterSupplyPlan"("zoneId");

-- CreateIndex
CREATE INDEX "JointWaterSupplyPlan_createdAt_idx" ON "JointWaterSupplyPlan"("createdAt");

-- CreateIndex
CREATE INDEX "JointSupplyDetail_planId_idx" ON "JointSupplyDetail"("planId");

-- CreateIndex
CREATE INDEX "JointSupplyDetail_wellId_idx" ON "JointSupplyDetail"("wellId");
