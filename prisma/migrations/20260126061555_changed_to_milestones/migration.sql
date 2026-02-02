/*
  Warnings:

  - You are about to drop the `GoalStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalStepChecklistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalStepChecklistItemState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalStepEvidenceLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MilestoneKind" AS ENUM ('manual', 'checklist', 'keywords_tags', 'streak');

-- CreateEnum
CREATE TYPE "public"."EvidenceKind" AS ENUM ('achievement', 'streak_checkin', 'manual_checkoff', 'note', 'link');

-- DropForeignKey
ALTER TABLE "public"."GoalStep" DROP CONSTRAINT "GoalStep_goalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepChecklistItem" DROP CONSTRAINT "GoalStepChecklistItem_stepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepChecklistItemState" DROP CONSTRAINT "GoalStepChecklistItemState_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepChecklistItemState" DROP CONSTRAINT "GoalStepChecklistItemState_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepEvidenceLink" DROP CONSTRAINT "GoalStepEvidenceLink_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepEvidenceLink" DROP CONSTRAINT "GoalStepEvidenceLink_stepId_fkey";

-- DropTable
DROP TABLE "public"."GoalStep";

-- DropTable
DROP TABLE "public"."GoalStepChecklistItem";

-- DropTable
DROP TABLE "public"."GoalStepChecklistItemState";

-- DropTable
DROP TABLE "public"."GoalStepEvidenceLink";

-- DropEnum
DROP TYPE "public"."GoalStepKind";

-- CreateTable
CREATE TABLE "public"."GoalMilestone" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "kind" "public"."MilestoneKind" NOT NULL DEFAULT 'manual',
    "metricConfig" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalMilestoneChecklistItem" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalMilestoneChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalMilestoneChecklistItemState" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalMilestoneChecklistItemState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evidence" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "kind" "public"."EvidenceKind" NOT NULL,
    "achievementId" TEXT,
    "streakCheckInId" TEXT,
    "manualCheckoffId" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalMilestoneEvidenceLink" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "linkType" "public"."EvidenceLinkType" NOT NULL DEFAULT 'auto',
    "matchReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalMilestoneEvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalMilestoneManualCheckoff" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT true,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalMilestoneManualCheckoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalMilestoneStreakCheckIn" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekStart" TIMESTAMP(3),

    CONSTRAINT "GoalMilestoneStreakCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalMilestone_goalId_order_idx" ON "public"."GoalMilestone"("goalId", "order");

-- CreateIndex
CREATE INDEX "GoalMilestone_goalId_kind_idx" ON "public"."GoalMilestone"("goalId", "kind");

-- CreateIndex
CREATE INDEX "GoalMilestone_goalId_completedAt_idx" ON "public"."GoalMilestone"("goalId", "completedAt");

-- CreateIndex
CREATE INDEX "GoalMilestoneChecklistItem_milestoneId_order_idx" ON "public"."GoalMilestoneChecklistItem"("milestoneId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneChecklistItem_milestoneId_key_key" ON "public"."GoalMilestoneChecklistItem"("milestoneId", "key");

-- CreateIndex
CREATE INDEX "GoalMilestoneChecklistItemState_userId_checked_idx" ON "public"."GoalMilestoneChecklistItemState"("userId", "checked");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneChecklistItemState_itemId_userId_key" ON "public"."GoalMilestoneChecklistItemState"("itemId", "userId");

-- CreateIndex
CREATE INDEX "Evidence_userId_kind_idx" ON "public"."Evidence"("userId", "kind");

-- CreateIndex
CREATE INDEX "GoalMilestoneEvidenceLink_milestoneId_linkType_idx" ON "public"."GoalMilestoneEvidenceLink"("milestoneId", "linkType");

-- CreateIndex
CREATE INDEX "GoalMilestoneEvidenceLink_evidenceId_idx" ON "public"."GoalMilestoneEvidenceLink"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneEvidenceLink_milestoneId_evidenceId_key" ON "public"."GoalMilestoneEvidenceLink"("milestoneId", "evidenceId");

-- CreateIndex
CREATE INDEX "GoalMilestoneManualCheckoff_milestoneId_userId_checkedAt_idx" ON "public"."GoalMilestoneManualCheckoff"("milestoneId", "userId", "checkedAt");

-- CreateIndex
CREATE INDEX "GoalMilestoneStreakCheckIn_milestoneId_userId_occurredAt_idx" ON "public"."GoalMilestoneStreakCheckIn"("milestoneId", "userId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "GoalMilestoneStreakCheckIn_milestoneId_userId_weekStart_key" ON "public"."GoalMilestoneStreakCheckIn"("milestoneId", "userId", "weekStart");

-- AddForeignKey
ALTER TABLE "public"."GoalMilestone" ADD CONSTRAINT "GoalMilestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItem" ADD CONSTRAINT "GoalMilestoneChecklistItem_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItemState" ADD CONSTRAINT "GoalMilestoneChecklistItemState_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."GoalMilestoneChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_streakCheckInId_fkey" FOREIGN KEY ("streakCheckInId") REFERENCES "public"."GoalMilestoneStreakCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_manualCheckoffId_fkey" FOREIGN KEY ("manualCheckoffId") REFERENCES "public"."GoalMilestoneManualCheckoff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" ADD CONSTRAINT "GoalMilestoneEvidenceLink_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneEvidenceLink" ADD CONSTRAINT "GoalMilestoneEvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "public"."Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" ADD CONSTRAINT "GoalMilestoneManualCheckoff_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneManualCheckoff" ADD CONSTRAINT "GoalMilestoneManualCheckoff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" ADD CONSTRAINT "GoalMilestoneStreakCheckIn_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."GoalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestoneStreakCheckIn" ADD CONSTRAINT "GoalMilestoneStreakCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
