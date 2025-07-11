/*
  Warnings:

  - You are about to drop the column `jobApplicationID` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_jobApplicationID_fkey";

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "goodFit" TEXT,
ADD COLUMN     "grow" TEXT,
ADD COLUMN     "knowAboutCompany" TEXT,
ADD COLUMN     "likeAboutCompany" TEXT,
ADD COLUMN     "otherQuestions" TEXT;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "jobApplicationID",
ADD COLUMN     "educationID" TEXT,
ADD COLUMN     "jobAppID" TEXT,
ADD COLUMN     "jobPositionID" TEXT;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_jobAppID_fkey" FOREIGN KEY ("jobAppID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_educationID_fkey" FOREIGN KEY ("educationID") REFERENCES "Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;
