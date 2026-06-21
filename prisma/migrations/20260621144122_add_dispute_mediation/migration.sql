-- CreateTable
CREATE TABLE "DisputeCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeNo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_ACCEPT',
    "mediatorName" TEXT,
    "expectedDays" INTEGER,
    "acceptedAt" DATETIME,
    "closedAt" DATETIME,
    "archivedAt" DATETIME,
    "result" TEXT,
    "resultNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DisputeFarmerLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    CONSTRAINT "DisputeFarmerLink_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "DisputeCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DisputeFarmerLink_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeApplicationLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    CONSTRAINT "DisputeApplicationLink_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "DisputeCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DisputeApplicationLink_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeMediationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL,
    "recorderName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isOnSiteInspection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeMediationRecord_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "DisputeCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DisputeCase_disputeNo_key" ON "DisputeCase"("disputeNo");

-- CreateIndex
CREATE INDEX "DisputeCase_status_idx" ON "DisputeCase"("status");

-- CreateIndex
CREATE INDEX "DisputeCase_type_idx" ON "DisputeCase"("type");

-- CreateIndex
CREATE INDEX "DisputeCase_occurredAt_idx" ON "DisputeCase"("occurredAt");

-- CreateIndex
CREATE INDEX "DisputeFarmerLink_disputeId_idx" ON "DisputeFarmerLink"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeFarmerLink_farmerId_idx" ON "DisputeFarmerLink"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeFarmerLink_disputeId_farmerId_key" ON "DisputeFarmerLink"("disputeId", "farmerId");

-- CreateIndex
CREATE INDEX "DisputeApplicationLink_disputeId_idx" ON "DisputeApplicationLink"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeApplicationLink_applicationId_idx" ON "DisputeApplicationLink"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeApplicationLink_disputeId_applicationId_key" ON "DisputeApplicationLink"("disputeId", "applicationId");

-- CreateIndex
CREATE INDEX "DisputeMediationRecord_disputeId_idx" ON "DisputeMediationRecord"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeMediationRecord_recordedAt_idx" ON "DisputeMediationRecord"("recordedAt");
