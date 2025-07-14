/*
  Warnings:

  - A unique constraint covering the columns `[userID,jobApplicationId,questionID]` on the table `PrepAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PrepAnswer_userID_jobApplicationId_questionID_key" ON "PrepAnswer"("userID", "jobApplicationId", "questionID");
