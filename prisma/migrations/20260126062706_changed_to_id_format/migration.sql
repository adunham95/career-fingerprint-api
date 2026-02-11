/*
  Warnings:

  - You are about to drop the column `achievementId` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `manualCheckoffId` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `streakCheckInId` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `goalId` on the `GoalMilestone` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `GoalMilestoneChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `GoalMilestoneChecklistItemState` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GoalMilestoneChecklistItemState` table. All the data in the column will be lost.
  - You are about to drop the column `evidenceId` on the `GoalMilestoneEvidenceLink` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `GoalMilestoneEvidenceLink` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `GoalMilestoneManualCheckoff` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `GoalMilestoneStreakCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GoalMilestoneStreakCheckIn` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[milestoneID,key]` on the table `GoalMilestoneChecklistItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemID,userID]` on the table `GoalMilestoneChecklistItemState` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[milestoneID,evidenceID]` on the table `GoalMilestoneEvidenceLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[milestoneID,userID,weekStart]` on the table `GoalMilestoneStreakCheckIn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userID` to the `Evidence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goalID` to the `GoalMilestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milestoneID` to the `GoalMilestoneChecklistItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemID` to the `GoalMilestoneChecklistItemState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `GoalMilestoneChecklistItemState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `evidenceID` to the `GoalMilestoneEvidenceLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milestoneID` to the `GoalMilestoneEvidenceLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milestoneID` to the `GoalMilestoneManualCheckoff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milestoneID` to the `GoalMilestoneStreakCheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `GoalMilestoneStreakCheckIn` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_manualCheckoffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_streakCheckInId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestone" DROP CONSTRAINT "GoalMilestone_goalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItem" DROP CONSTRAINT "GoalMilestoneChecklistItem_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItemState" DROP CONSTRAINT "GoalMilestoneChecklistItemState_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" DROP CONSTRAINT "GoalMilestoneEvidenceLink_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" DROP CONSTRAINT "GoalMilestoneEvidenceLink_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" DROP CONSTRAINT "GoalMilestoneManualCheckoff_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" DROP CONSTRAINT "GoalMilestoneStreakCheckIn_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" DROP CONSTRAINT "GoalMilestoneStreakCheckIn_userId_fkey";

-- DropIndex
DROP INDEX "public"."Evidence_userId_kind_idx";

-- DropIndex
DROP INDEX "public"."Goal_userId_status_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestone_goalId_completedAt_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestone_goalId_kind_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestone_goalId_order_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneChecklistItem_milestoneId_key_key";

-- DropIndex
DROP INDEX "public"."GoalMilestoneChecklistItem_milestoneId_order_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneChecklistItemState_itemId_userId_key";

-- DropIndex
DROP INDEX "public"."GoalMilestoneChecklistItemState_userId_checked_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneEvidenceLink_evidenceId_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneEvidenceLink_milestoneId_evidenceId_key";

-- DropIndex
DROP INDEX "public"."GoalMilestoneEvidenceLink_milestoneId_linkType_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneManualCheckoff_milestoneId_userId_checkedAt_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneStreakCheckIn_milestoneId_userId_occurredAt_idx";

-- DropIndex
DROP INDEX "public"."GoalMilestoneStreakCheckIn_milestoneId_userId_weekStart_key";

-- AlterTable
ALTER TABLE "public"."Evidence" DROP COLUMN "achievementId",
DROP COLUMN "manualCheckoffId",
DROP COLUMN "streakCheckInId",
DROP COLUMN "userId",
ADD COLUMN     "achievementID" TEXT,
ADD COLUMN     "manualCheckoffID" TEXT,
ADD COLUMN     "streakCheckInID" TEXT,
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Goal" DROP COLUMN "userId",
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestone" DROP COLUMN "goalId",
ADD COLUMN     "goalID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestoneChecklistItem" DROP COLUMN "milestoneId",
ADD COLUMN     "milestoneID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestoneChecklistItemState" DROP COLUMN "itemId",
DROP COLUMN "userId",
ADD COLUMN     "itemID" TEXT NOT NULL,
ADD COLUMN     "userID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestoneEvidenceLink" DROP COLUMN "evidenceId",
DROP COLUMN "milestoneId",
ADD COLUMN     "evidenceID" TEXT NOT NULL,
ADD COLUMN     "milestoneID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestoneManualCheckoff" DROP COLUMN "milestoneId",
ADD COLUMN     "milestoneID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" DROP COLUMN "milestoneId",
DROP COLUMN "userId",
ADD COLUMN     "milestoneID" TEXT NOT NULL,
ADD COLUMN     "userID" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Evidence_userID_kind_idx" ON "public"."Evidence"("userID", "kind");

-- CreateIndex
CREATE INDEX "Goal_userID_status_idx" ON "public"."Goal"("userID", "status");

-- CreateIndex
CREATE INDEX "GoalMilestone_goalID_order_idx" ON "public"."GoalMilestone"("goalID", "order");

-- CreateIndex
CREATE INDEX "GoalMilestone_goalID_kind_idx" ON "public"."GoalMilestone"("goalID", "kind");

-- CreateIndex
CREATE INDEX "GoalMilestone_goalID_completedAt_idx" ON "public"."GoalMilestone"("goalID", "completedAt");

-- CreateIndex
CREATE INDEX "GoalMilestoneChecklistItem_milestoneID_order_idx" ON "public"."GoalMilestoneChecklistItem"("milestoneID", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneChecklistItem_milestoneID_key_key" ON "public"."GoalMilestoneChecklistItem"("milestoneID", "key");

-- CreateIndex
CREATE INDEX "GoalMilestoneChecklistItemState_userID_checked_idx" ON "public"."GoalMilestoneChecklistItemState"("userID", "checked");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneChecklistItemState_itemID_userID_key" ON "public"."GoalMilestoneChecklistItemState"("itemID", "userID");

-- CreateIndex
CREATE INDEX "GoalMilestoneEvidenceLink_milestoneID_linkType_idx" ON "public"."GoalMilestoneEvidenceLink"("milestoneID", "linkType");

-- CreateIndex
CREATE INDEX "GoalMilestoneEvidenceLink_evidenceID_idx" ON "public"."GoalMilestoneEvidenceLink"("evidenceID");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneEvidenceLink_milestoneID_evidenceID_key" ON "public"."GoalMilestoneEvidenceLink"("milestoneID", "evidenceID");

-- CreateIndex
CREATE INDEX "GoalMilestoneManualCheckoff_milestoneID_userId_checkedAt_idx" ON "public"."GoalMilestoneManualCheckoff"("milestoneID", "userId", "checkedAt");

-- CreateIndex
CREATE INDEX "GoalMilestoneStreakCheckIn_milestoneID_userID_occurredAt_idx" ON "public"."GoalMilestoneStreakCheckIn"("milestoneID", "userID", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneStreakCheckIn_milestoneID_userID_weekStart_key" ON "public"."GoalMilestoneStreakCheckIn"("milestoneID", "userID", "weekStart");

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestone" ADD CONSTRAINT "GoalMilestone_goalID_fkey" FOREIGN KEY ("goalID") REFERENCES "public"."Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItem" ADD CONSTRAINT "GoalMilestoneChecklistItem_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItemState" ADD CONSTRAINT "GoalMilestoneChecklistItemState_itemID_fkey" FOREIGN KEY ("itemID") REFERENCES "public"."GoalMilestoneChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_achievementID_fkey" FOREIGN KEY ("achievementID") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_streakCheckInID_fkey" FOREIGN KEY ("streakCheckInID") REFERENCES "public"."GoalMilestoneStreakCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_manualCheckoffID_fkey" FOREIGN KEY ("manualCheckoffID") REFERENCES "public"."GoalMilestoneManualCheckoff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" ADD CONSTRAINT "GoalMilestoneEvidenceLink_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" ADD CONSTRAINT "GoalMilestoneEvidenceLink_evidenceID_fkey" FOREIGN KEY ("evidenceID") REFERENCES "public"."Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" ADD CONSTRAINT "GoalMilestoneManualCheckoff_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" ADD CONSTRAINT "GoalMilestoneStreakCheckIn_milestoneID_fkey" FOREIGN KEY ("milestoneID") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" ADD CONSTRAINT "GoalMilestoneStreakCheckIn_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
