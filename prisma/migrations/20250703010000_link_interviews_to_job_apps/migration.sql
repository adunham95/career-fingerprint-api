-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "jobAppID" TEXT;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobAppID_fkey" FOREIGN KEY ("jobAppID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
