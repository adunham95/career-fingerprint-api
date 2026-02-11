-- AlterTable
ALTER TABLE "public"."Goal" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."GoalMilestone" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "targetGoal" INTEGER NOT NULL DEFAULT 0;
