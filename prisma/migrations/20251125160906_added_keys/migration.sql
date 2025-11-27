/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `GoalSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GoalSkill_category_key" ON "public"."GoalSkill"("category");

-- CreateIndex
CREATE INDEX "GoalSkill_category_idx" ON "public"."GoalSkill"("category");
