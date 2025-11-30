-- CreateTable
CREATE TABLE "public"."_linkedGoalAchievement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_linkedGoalAchievement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_linkedGoalAchievement_B_index" ON "public"."_linkedGoalAchievement"("B");

-- AddForeignKey
ALTER TABLE "public"."_linkedGoalAchievement" ADD CONSTRAINT "_linkedGoalAchievement_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_linkedGoalAchievement" ADD CONSTRAINT "_linkedGoalAchievement_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
