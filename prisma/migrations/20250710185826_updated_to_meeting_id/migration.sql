/*
  Warnings:

  - You are about to drop the column `interviewID` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_interviewID_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "interviewID",
ADD COLUMN     "meetingID" TEXT;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_meetingID_fkey" FOREIGN KEY ("meetingID") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
