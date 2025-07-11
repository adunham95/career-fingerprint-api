-- AlterTable
ALTER TABLE "Highlight" ADD COLUMN     "meetingID" TEXT;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_meetingID_fkey" FOREIGN KEY ("meetingID") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
