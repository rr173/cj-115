-- CreateTable
CREATE TABLE "WaterRightsAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "initialQuota" REAL NOT NULL,
    "boughtVolume" REAL NOT NULL DEFAULT 0,
    "soldVolume" REAL NOT NULL DEFAULT 0,
    "usedVolume" REAL NOT NULL DEFAULT 0,
    "frozenVolume" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterRightsAccount_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterRightsSellOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "sellVolume" REAL NOT NULL,
    "remainingVolume" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterRightsSellOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterRightsTradeRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "volume" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterRightsTradeRecord_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "WaterRightsSellOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterRightsTradeRecord_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterRightsTradeRecord_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WaterRightsAccount_farmerId_idx" ON "WaterRightsAccount"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterRightsAccount_farmerId_year_quarter_key" ON "WaterRightsAccount"("farmerId", "year", "quarter");

-- CreateIndex
CREATE INDEX "WaterRightsSellOrder_sellerId_idx" ON "WaterRightsSellOrder"("sellerId");

-- CreateIndex
CREATE INDEX "WaterRightsSellOrder_status_idx" ON "WaterRightsSellOrder"("status");

-- CreateIndex
CREATE INDEX "WaterRightsSellOrder_expiresAt_idx" ON "WaterRightsSellOrder"("expiresAt");

-- CreateIndex
CREATE INDEX "WaterRightsTradeRecord_buyerId_idx" ON "WaterRightsTradeRecord"("buyerId");

-- CreateIndex
CREATE INDEX "WaterRightsTradeRecord_sellerId_idx" ON "WaterRightsTradeRecord"("sellerId");

-- CreateIndex
CREATE INDEX "WaterRightsTradeRecord_sellOrderId_idx" ON "WaterRightsTradeRecord"("sellOrderId");
