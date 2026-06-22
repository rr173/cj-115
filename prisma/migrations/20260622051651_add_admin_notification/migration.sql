-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmerId" TEXT,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isAdminAlert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "WaterApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("applicationId", "content", "createdAt", "farmerId", "id", "isRead", "title", "type") SELECT "applicationId", "content", "createdAt", "farmerId", "id", "isRead", "title", "type" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_farmerId_idx" ON "Notification"("farmerId");
CREATE INDEX "Notification_applicationId_idx" ON "Notification"("applicationId");
CREATE INDEX "Notification_isAdminAlert_idx" ON "Notification"("isAdminAlert");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
