/*
  Warnings:

  - A unique constraint covering the columns `[question]` on the table `PrepQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PrepQuestion_question_key" ON "PrepQuestion"("question");
