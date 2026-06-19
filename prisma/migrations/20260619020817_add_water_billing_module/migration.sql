-- CreateTable
CREATE TABLE "WaterPriceScheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "basePrice" REAL NOT NULL,
    "tier1Multiplier" REAL NOT NULL DEFAULT 1.0,
    "tier2Threshold" REAL NOT NULL DEFAULT 1.3,
    "tier2Multiplier" REAL NOT NULL DEFAULT 1.5,
    "tier3Multiplier" REAL NOT NULL DEFAULT 2.0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChannelPriceBinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelPriceBinding_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelPriceBinding_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "WaterPriceScheme" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "billingYear" INTEGER NOT NULL,
    "billingMonth" INTEGER NOT NULL,
    "quotaVolume" REAL NOT NULL,
    "totalVolume" REAL NOT NULL,
    "tier1Volume" REAL NOT NULL DEFAULT 0,
    "tier1Amount" REAL NOT NULL DEFAULT 0,
    "tier2Volume" REAL NOT NULL DEFAULT 0,
    "tier2Amount" REAL NOT NULL DEFAULT 0,
    "tier3Volume" REAL NOT NULL DEFAULT 0,
    "tier3Amount" REAL NOT NULL DEFAULT 0,
    "baseAmount" REAL NOT NULL DEFAULT 0,
    "subsidyAmount" REAL NOT NULL DEFAULT 0,
    "subsidyVolume" REAL NOT NULL DEFAULT 0,
    "lateFeeAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "lastLateFeeCalc" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterBill_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "WaterPriceScheme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillTierDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "rangeStart" REAL NOT NULL,
    "rangeEnd" REAL,
    "unitPrice" REAL NOT NULL,
    "volume" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BillTierDetail_billId_fkey" FOREIGN KEY ("billId") REFERENCES "WaterBill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRecord_billId_fkey" FOREIGN KEY ("billId") REFERENCES "WaterBill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentRecord_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FarmerAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "freezeReason" TEXT,
    "frozenAt" DATETIME,
    "lastOverdueMonths" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FarmerAccount_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterPriceScheme_code_key" ON "WaterPriceScheme"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPriceBinding_channelId_key" ON "ChannelPriceBinding"("channelId");

-- CreateIndex
CREATE INDEX "ChannelPriceBinding_schemeId_idx" ON "ChannelPriceBinding"("schemeId");

-- CreateIndex
CREATE INDEX "WaterBill_schemeId_idx" ON "WaterBill"("schemeId");

-- CreateIndex
CREATE INDEX "WaterBill_status_idx" ON "WaterBill"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WaterBill_farmerId_billingYear_billingMonth_key" ON "WaterBill"("farmerId", "billingYear", "billingMonth");

-- CreateIndex
CREATE INDEX "BillTierDetail_billId_idx" ON "BillTierDetail"("billId");

-- CreateIndex
CREATE INDEX "PaymentRecord_billId_idx" ON "PaymentRecord"("billId");

-- CreateIndex
CREATE INDEX "PaymentRecord_farmerId_idx" ON "PaymentRecord"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerAccount_farmerId_key" ON "FarmerAccount"("farmerId");
