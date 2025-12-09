-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "currentSeats" INTEGER DEFAULT 0,
ADD COLUMN     "maxAdminSeats" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "adminSeats" INTEGER DEFAULT 1,
ADD COLUMN     "hasMeteredSeats" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxSeats" INTEGER,
ADD COLUMN     "seatStripPriceID" TEXT;

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "isMetered" BOOLEAN NOT NULL DEFAULT false;
