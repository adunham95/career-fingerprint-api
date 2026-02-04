/*
  Warnings:

  - You are about to drop the column `targetGoal` on the `GoalMilestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."GoalMilestone" DROP COLUMN "targetGoal",
ADD COLUMN     "targetCount" INTEGER NOT NULL DEFAULT 0;
