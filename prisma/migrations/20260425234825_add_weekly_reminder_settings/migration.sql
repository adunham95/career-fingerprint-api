-- CreateTable: WeeklyReminderSettings, copy existing data, then drop old columns

CREATE TABLE "WeeklyReminderSettings" (
  "id"           SERIAL PRIMARY KEY,
  "userID"       INTEGER NOT NULL,
  "preferredDay" INTEGER NOT NULL DEFAULT 5,
  "nextSendAt"   TIMESTAMP(3),
  CONSTRAINT "WeeklyReminderSettings_userID_key" UNIQUE ("userID"),
  CONSTRAINT "WeeklyReminderSettings_userID_fkey"
    FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy existing data from User
INSERT INTO "WeeklyReminderSettings" ("userID", "preferredDay", "nextSendAt")
SELECT "id", "preferredDay", "nextSendAt"
FROM "User";

-- AlterTable: drop old columns from User
ALTER TABLE "User" DROP COLUMN "nextSendAt";
ALTER TABLE "User" DROP COLUMN "preferredDay";
