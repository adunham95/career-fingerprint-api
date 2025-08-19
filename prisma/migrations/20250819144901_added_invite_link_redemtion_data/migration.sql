-- AlterTable
ALTER TABLE "public"."InviteRedemption" ADD COLUMN     "creditedAt" TIMESTAMP(3),
ADD COLUMN     "eligibleAt" TIMESTAMP(3),
ADD COLUMN     "rewardStatus" TEXT NOT NULL DEFAULT 'pending';
