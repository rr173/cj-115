-- CreateTable
CREATE TABLE "IrrigationEfficiencyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "plannedVolume" REAL NOT NULL,
    "theoreticalLossVolume" REAL NOT NULL,
    "theoreticalFieldVolume" REAL NOT NULL,
    "actualUsageVolume" REAL,
    "efficiencyDeviationRate" REAL,
    "compositeUtilizationCoefficient" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IrrigationEfficiencyRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IrrigationEfficiencyRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IrrigationEfficiencyRecord_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuarterlyAssessmentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChannelQuarterlyAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "configuredCoefficient" REAL NOT NULL,
    "actualLossRate" REAL NOT NULL,
    "deviation" REAL NOT NULL,
    "assessmentStatus" TEXT NOT NULL,
    "suggestion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelQuarterlyAssessment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyAssessmentReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelQuarterlyAssessment_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FarmerQuarterlyAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "averageDeviationRate" REAL NOT NULL,
    "assessmentStatus" TEXT NOT NULL,
    "creditScoreDeducted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FarmerQuarterlyAssessment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "QuarterlyAssessmentReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FarmerQuarterlyAssessment_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "waterUtilizationCoefficient" REAL NOT NULL DEFAULT 0.95,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Channel_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("code", "createdAt", "id", "inspectionCycleDays", "inspectionStatus", "length", "level", "maxFlow", "name", "parentId", "propagationDelay", "updatedAt") SELECT "code", "createdAt", "id", "inspectionCycleDays", "inspectionStatus", "length", "level", "maxFlow", "name", "parentId", "propagationDelay", "updatedAt" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_code_key" ON "Channel"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationEfficiencyRecord_applicationId_key" ON "IrrigationEfficiencyRecord"("applicationId");

-- CreateIndex
CREATE INDEX "IrrigationEfficiencyRecord_farmerId_idx" ON "IrrigationEfficiencyRecord"("farmerId");

-- CreateIndex
CREATE INDEX "IrrigationEfficiencyRecord_channelId_idx" ON "IrrigationEfficiencyRecord"("channelId");

-- CreateIndex
CREATE INDEX "IrrigationEfficiencyRecord_createdAt_idx" ON "IrrigationEfficiencyRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuarterlyAssessmentReport_year_quarter_key" ON "QuarterlyAssessmentReport"("year", "quarter");

-- CreateIndex
CREATE INDEX "ChannelQuarterlyAssessment_reportId_idx" ON "ChannelQuarterlyAssessment"("reportId");

-- CreateIndex
CREATE INDEX "ChannelQuarterlyAssessment_channelId_idx" ON "ChannelQuarterlyAssessment"("channelId");

-- CreateIndex
CREATE INDEX "FarmerQuarterlyAssessment_reportId_idx" ON "FarmerQuarterlyAssessment"("reportId");

-- CreateIndex
CREATE INDEX "FarmerQuarterlyAssessment_farmerId_idx" ON "FarmerQuarterlyAssessment"("farmerId");
