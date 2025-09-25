-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "nextSendAt" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York';
