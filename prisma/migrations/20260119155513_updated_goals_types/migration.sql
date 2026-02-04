/*
  Warnings:

  - The values [competency,milestone,habit,output,learning,process,custom] on the enum `GoalStepKind` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `achievementId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `completedBy` on the `GoalStep` table. All the data in the column will be lost.
  - You are about to drop the column `metricType` on the `GoalStep` table. All the data in the column will be lost.
  - You are about to drop the `GoalStepEvidence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoalStepRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."GoalStepKind_new" AS ENUM ('manual', 'checklist', 'keywords_tags', 'streak');
ALTER TABLE "public"."GoalStep" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "public"."GoalStep" ALTER COLUMN "kind" TYPE "public"."GoalStepKind_new" USING ("kind"::text::"public"."GoalStepKind_new");
ALTER TYPE "public"."GoalStepKind" RENAME TO "GoalStepKind_old";
ALTER TYPE "public"."GoalStepKind_new" RENAME TO "GoalStepKind";
DROP TYPE "public"."GoalStepKind_old";
ALTER TABLE "public"."GoalStep" ALTER COLUMN "kind" SET DEFAULT 'manual';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Goal" DROP CONSTRAINT "Goal_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepEvidence" DROP CONSTRAINT "GoalStepEvidence_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepEvidence" DROP CONSTRAINT "GoalStepEvidence_matchedRuleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepEvidence" DROP CONSTRAINT "GoalStepEvidence_stepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GoalStepRule" DROP CONSTRAINT "GoalStepRule_stepId_fkey";

-- AlterTable
ALTER TABLE "public"."Goal" DROP COLUMN "achievementId";

-- AlterTable
ALTER TABLE "public"."GoalStep" DROP COLUMN "completedBy",
DROP COLUMN "metricType",
ALTER COLUMN "kind" SET DEFAULT 'manual';

-- DropTable
DROP TABLE "public"."GoalStepEvidence";

-- DropTable
DROP TABLE "public"."GoalStepRule";

-- DropEnum
DROP TYPE "public"."GoalStepMetricType";

-- DropEnum
DROP TYPE "public"."StepRuleType";

-- CreateTable
CREATE TABLE "public"."GoalStepChecklistItem" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalStepChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalStepChecklistItemState" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalStepChecklistItemState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalStepEvidenceLink" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "linkType" "public"."EvidenceLinkType" NOT NULL DEFAULT 'auto',
    "matchReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalStepEvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalStepChecklistItem_stepId_order_idx" ON "public"."GoalStepChecklistItem"("stepId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GoalStepChecklistItem_stepId_key_key" ON "public"."GoalStepChecklistItem"("stepId", "key");

-- CreateIndex
CREATE INDEX "GoalStepChecklistItemState_userId_checked_idx" ON "public"."GoalStepChecklistItemState"("userId", "checked");

-- CreateIndex
CREATE UNIQUE INDEX "GoalStepChecklistItemState_itemId_userId_key" ON "public"."GoalStepChecklistItemState"("itemId", "userId");

-- CreateIndex
CREATE INDEX "GoalStepEvidenceLink_achievementId_idx" ON "public"."GoalStepEvidenceLink"("achievementId");

-- CreateIndex
CREATE INDEX "GoalStepEvidenceLink_stepId_linkType_idx" ON "public"."GoalStepEvidenceLink"("stepId", "linkType");

-- CreateIndex
CREATE UNIQUE INDEX "GoalStepEvidenceLink_stepId_achievementId_key" ON "public"."GoalStepEvidenceLink"("stepId", "achievementId");

-- CreateIndex
CREATE INDEX "GoalStep_goalId_kind_idx" ON "public"."GoalStep"("goalId", "kind");

-- AddForeignKey
ALTER TABLE "public"."GoalStepChecklistItem" ADD CONSTRAINT "GoalStepChecklistItem_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."GoalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepChecklistItemState" ADD CONSTRAINT "GoalStepChecklistItemState_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."GoalStepChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepChecklistItemState" ADD CONSTRAINT "GoalStepChecklistItemState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepEvidenceLink" ADD CONSTRAINT "GoalStepEvidenceLink_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."GoalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepEvidenceLink" ADD CONSTRAINT "GoalStepEvidenceLink_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
