/*
  Warnings:

  - A unique constraint covering the columns `[userID,jobApplicationID,questionID,meetingID]` on the table `PrepAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PrepAnswer_userID_jobApplicationID_questionID_key";

-- AlterTable
ALTER TABLE "PrepAnswer" ADD COLUMN     "meetingID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PrepAnswer_userID_jobApplicationID_questionID_meetingID_key" ON "PrepAnswer"("userID", "jobApplicationID", "questionID", "meetingID");

-- AddForeignKey
ALTER TABLE "PrepAnswer" ADD CONSTRAINT "PrepAnswer_meetingID_fkey" FOREIGN KEY ("meetingID") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
