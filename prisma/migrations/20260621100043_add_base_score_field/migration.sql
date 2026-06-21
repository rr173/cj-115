-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditScoreHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previousScore" INTEGER NOT NULL,
    "newScore" INTEGER NOT NULL,
    "previousLevel" TEXT NOT NULL,
    "newLevel" TEXT NOT NULL,
    "baseScore" INTEGER NOT NULL DEFAULT 20,
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
INSERT INTO "new_CreditScoreHistory" ("createdAt", "debtPenalty", "deviationScore", "farmerId", "hasUnpaidDebt", "id", "newLevel", "newScore", "operator", "overuseScore", "paymentScore", "previousLevel", "previousScore", "reason", "tradingScore", "type") SELECT "createdAt", "debtPenalty", "deviationScore", "farmerId", "hasUnpaidDebt", "id", "newLevel", "newScore", "operator", "overuseScore", "paymentScore", "previousLevel", "previousScore", "reason", "tradingScore", "type" FROM "CreditScoreHistory";
DROP TABLE "CreditScoreHistory";
ALTER TABLE "new_CreditScoreHistory" RENAME TO "CreditScoreHistory";
CREATE INDEX "CreditScoreHistory_farmerId_idx" ON "CreditScoreHistory"("farmerId");
CREATE INDEX "CreditScoreHistory_createdAt_idx" ON "CreditScoreHistory"("createdAt");
CREATE TABLE "new_FarmerCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 60,
    "level" TEXT NOT NULL DEFAULT 'C',
    "baseScore" INTEGER NOT NULL DEFAULT 20,
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
INSERT INTO "new_FarmerCredit" ("createdAt", "debtPenalty", "deviationScore", "farmerId", "hasUnpaidDebt", "id", "lastCalcAt", "level", "overuseScore", "paymentScore", "score", "tradingScore", "updatedAt") SELECT "createdAt", "debtPenalty", "deviationScore", "farmerId", "hasUnpaidDebt", "id", "lastCalcAt", "level", "overuseScore", "paymentScore", "score", "tradingScore", "updatedAt" FROM "FarmerCredit";
DROP TABLE "FarmerCredit";
ALTER TABLE "new_FarmerCredit" RENAME TO "FarmerCredit";
CREATE UNIQUE INDEX "FarmerCredit_farmerId_key" ON "FarmerCredit"("farmerId");
CREATE INDEX "FarmerCredit_level_idx" ON "FarmerCredit"("level");
CREATE INDEX "FarmerCredit_score_idx" ON "FarmerCredit"("score");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
