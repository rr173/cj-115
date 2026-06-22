-- CreateTable
CREATE TABLE "IrrigationZoneChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IrrigationZoneChannel_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "IrrigationZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IrrigationZoneChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "IrrigationZoneChannel_zoneId_idx" ON "IrrigationZoneChannel"("zoneId");

-- CreateIndex
CREATE INDEX "IrrigationZoneChannel_channelId_idx" ON "IrrigationZoneChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "IrrigationZoneChannel_zoneId_channelId_key" ON "IrrigationZoneChannel"("zoneId", "channelId");
