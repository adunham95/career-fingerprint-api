-- AlterTable
ALTER TABLE "public"."WeeklyReminderSettings" ADD COLUMN     "emailsDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredHour" INTEGER NOT NULL DEFAULT 9;
