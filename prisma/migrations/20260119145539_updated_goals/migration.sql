/*
  Warnings:

  - You are about to drop the column `actions` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `currentPoints` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `lastProgressCalculatedAt` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `targetCount` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `Goal` table. All the data in the column will be lost.
  - The `status` column on the `Goal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `GoalSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_linkedGoalAchievement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."GoalStatus" AS ENUM ('active', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "public"."GoalStepKind" AS ENUM ('competency', 'milestone', 'habit', 'output', 'learning', 'process', 'custom');

-- CreateEnum
CREATE TYPE "public"."GoalStepMetricType" AS ENUM ('manual', 'count_evidence', 'score', 'checklist', 'streak');

-- CreateEnum
CREATE TYPE "public"."StepRuleType" AS ENUM ('keyword', 'tag', 'type', 'attribute', 'composite');

-- CreateEnum
CREATE TYPE "public"."EvidenceLinkType" AS ENUM ('auto', 'manual');

-- DropForeignKey
ALTER TABLE "public"."Goal" DROP CONSTRAINT "Goal_userID_fkey";

-- DropForeignKey
ALTER TABLE "public"."_linkedGoalAchievement" DROP CONSTRAINT "_linkedGoalAchievement_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_linkedGoalAchievement" DROP CONSTRAINT "_linkedGoalAchievement_B_fkey";

-- AlterTable
ALTER TABLE "public"."Goal" DROP COLUMN "actions",
DROP COLUMN "currentPoints",
DROP COLUMN "keywords",
DROP COLUMN "lastProgressCalculatedAt",
DROP COLUMN "name",
DROP COLUMN "progress",
DROP COLUMN "targetCount",
DROP COLUMN "userID",
ADD COLUMN     "achievementId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "targetDate" TIMESTAMP(3),
ADD COLUMN     "templateKey" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."GoalStatus" NOT NULL DEFAULT 'active';

-- DropTable
DROP TABLE "public"."GoalSkill";

-- DropTable
DROP TABLE "public"."_linkedGoalAchievement";

-- CreateTable
CREATE TABLE "public"."GoalStep" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "public"."GoalStepKind" NOT NULL DEFAULT 'custom',
    "order" INTEGER NOT NULL DEFAULT 0,
    "metricType" "public"."GoalStepMetricType" NOT NULL DEFAULT 'manual',
    "metricConfig" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalStepRule" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" "public"."StepRuleType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "points" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "timeWindowDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalStepRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GoalStepEvidence" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "linkType" "public"."EvidenceLinkType" NOT NULL DEFAULT 'auto',
    "matchedRuleId" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalStepEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalStep_goalId_order_idx" ON "public"."GoalStep"("goalId", "order");

-- CreateIndex
CREATE INDEX "GoalStep_goalId_completedAt_idx" ON "public"."GoalStep"("goalId", "completedAt");

-- CreateIndex
CREATE INDEX "GoalStepRule_stepId_type_idx" ON "public"."GoalStepRule"("stepId", "type");

-- CreateIndex
CREATE INDEX "GoalStepRule_stepId_enabled_idx" ON "public"."GoalStepRule"("stepId", "enabled");

-- CreateIndex
CREATE INDEX "GoalStepEvidence_achievementId_idx" ON "public"."GoalStepEvidence"("achievementId");

-- CreateIndex
CREATE INDEX "GoalStepEvidence_stepId_linkType_idx" ON "public"."GoalStepEvidence"("stepId", "linkType");

-- CreateIndex
CREATE UNIQUE INDEX "GoalStepEvidence_stepId_achievementId_key" ON "public"."GoalStepEvidence"("stepId", "achievementId");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "public"."Goal"("userId", "status");

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStep" ADD CONSTRAINT "GoalStep_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepRule" ADD CONSTRAINT "GoalStepRule_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."GoalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepEvidence" ADD CONSTRAINT "GoalStepEvidence_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."GoalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepEvidence" ADD CONSTRAINT "GoalStepEvidence_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GoalStepEvidence" ADD CONSTRAINT "GoalStepEvidence_matchedRuleId_fkey" FOREIGN KEY ("matchedRuleId") REFERENCES "public"."GoalStepRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
