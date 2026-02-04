-- AlterTable
ALTER TABLE "public"."GoalMilestone" ADD COLUMN     "userID" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."GoalMilestone" ADD CONSTRAINT "GoalMilestone_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
