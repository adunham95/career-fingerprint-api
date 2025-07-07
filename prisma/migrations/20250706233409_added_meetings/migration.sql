/*
  Warnings:

  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_jobAppID_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_userID_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_interviewID_fkey";

-- DropTable
DROP TABLE "Interview";

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobAppID" TEXT,
    "jobPositionID" TEXT,
    "educationID" TEXT,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_jobAppID_fkey" FOREIGN KEY ("jobAppID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_educationID_fkey" FOREIGN KEY ("educationID") REFERENCES "Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_interviewID_fkey" FOREIGN KEY ("interviewID") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
