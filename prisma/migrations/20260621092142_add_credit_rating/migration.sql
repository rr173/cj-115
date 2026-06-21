-- CreateTable
CREATE TABLE "FarmerCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 60,
    "level" TEXT NOT NULL DEFAULT 'C',
    "paymentScore" INTEGER NOT NULL DEFAULT 0,
    "deviationScore" INTEGER NOT NULL DEFAULT 0,
    "overuseScore" INTEGER NOT NULL DEFAULT 0,
    "tradingScore" INTEGER NOT NULL DEFAULT 5,
    "hasUnpaidDebt" BOOLEAN NOT NULL DEFAULT false,
    "debtPenalty" INTEGER NOT NULL DEFAULT 0,
    "lastCalcAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FarmerCredit_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditScoreHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previousScore" INTEGER NOT NULL,
    "newScore" INTEGER NOT NULL,
    "previousLevel" TEXT NOT NULL,
    "newLevel" TEXT NOT NULL,
    "paymentScore" INTEGER NOT NULL DEFAULT 0,
    "deviationScore" INTEGER NOT NULL DEFAULT 0,
    "overuseScore" INTEGER NOT NULL DEFAULT 0,
    "tradingScore" INTEGER NOT NULL DEFAULT 0,
    "hasUnpaidDebt" BOOLEAN NOT NULL DEFAULT false,
    "debtPenalty" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "operator" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditScoreHistory_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmerCredit_farmerId_key" ON "FarmerCredit"("farmerId");

-- CreateIndex
CREATE INDEX "FarmerCredit_level_idx" ON "FarmerCredit"("level");

-- CreateIndex
CREATE INDEX "FarmerCredit_score_idx" ON "FarmerCredit"("score");

-- CreateIndex
CREATE INDEX "CreditScoreHistory_farmerId_idx" ON "CreditScoreHistory"("farmerId");

-- CreateIndex
CREATE INDEX "CreditScoreHistory_createdAt_idx" ON "CreditScoreHistory"("createdAt");
