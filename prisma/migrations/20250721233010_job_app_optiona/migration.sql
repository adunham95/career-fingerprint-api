/*
  Warnings:

  - A unique constraint covering the columns `[userID,questionID,meetingID]` on the table `PrepAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PrepAnswer_userID_jobApplicationID_questionID_meetingID_key";

-- CreateIndex
CREATE UNIQUE INDEX "PrepAnswer_userID_questionID_meetingID_key" ON "PrepAnswer"("userID", "questionID", "meetingID");
