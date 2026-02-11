/*
  Warnings:

  - You are about to drop the `GoalMilestoneChecklistItemState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."GoalMilestoneChecklistItemState" DROP CONSTRAINT "GoalMilestoneChecklistItemState_itemID_fkey";

-- AlterTable
ALTER TABLE "public"."GoalMilestoneChecklistItem" ADD COLUMN     "checked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."GoalMilestoneChecklistItemState";
