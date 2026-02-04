/*
  Warnings:

  - You are about to drop the column `manualCheckoffID` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `streakCheckInID` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the `GoalMilestoneEvidenceLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalMilestoneManualCheckoff` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `weekStart` on table `GoalMilestoneStreakCheckIn` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_manualCheckoffID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_streakCheckInID_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" DROP CONSTRAINT "GoalMilestoneEvidenceLink_evidenceID_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" DROP CONSTRAINT "GoalMilestoneEvidenceLink_milestoneID_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" DROP CONSTRAINT "GoalMilestoneManualCheckoff_milestoneID_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" DROP CONSTRAINT "GoalMilestoneManualCheckoff_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Evidence" DROP COLUMN "manualCheckoffID",
DROP COLUMN "streakCheckInID",
ADD COLUMN     "linkType" "public"."EvidenceLinkType" NOT NULL DEFAULT 'auto',
ADD COLUMN     "matchReason" TEXT,
ADD COLUMN     "milestoneID" TEXT,
ADD COLUMN     "occurredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" ALTER COLUMN "weekStart" SET NOT NULL;

-- DropTable
DROP TABLE "public"."GoalMilestoneEvidenceLink";

-- DropTable
DROP TABLE "public"."GoalMilestoneManualCheckoff";

-- CreateTable
CREATE TABLE "public"."GoalMilestoneManualState" (
    "id" TEXT NOT NULL,
    "milestoneID" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalMilestoneManualState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalMilestoneManualState_milestoneID_checked_idx" ON "public"."GoalMilestoneManualState"("milestoneID", "checked");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneManualState_milestoneID_userID_key" ON "public"."GoalMilestoneManualState"("milestoneID", "userID");

-- CreateIndex
CREATE INDEX "Evidence_milestoneID_kind_idx" ON "public"."Evidence"("milestoneID", "kind");

-- CreateIndex
CREATE INDEX "Evidence_milestoneID_createdAt_idx" ON "public"."Evidence"("milestoneID", "createdAt");

-- CreateIndex
CREATE INDEX "GoalMilestoneStreakCheckIn_milestoneID_weekStart_idx" ON "public"."GoalMilestoneStreakCheckIn"("milestoneID", "weekStart");

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneManualState" ADD CONSTRAINT "GoalMilestoneManualState_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneManualState" ADD CONSTRAINT "GoalMilestoneManualState_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
