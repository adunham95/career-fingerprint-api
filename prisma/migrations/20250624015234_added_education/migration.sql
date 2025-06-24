/*
  Warnings:

  - You are about to drop the column `resumeID` on the `JobPosition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPosition" DROP COLUMN "resumeID";

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institution" TEXT NOT NULL DEFAULT '',
    "degree" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "currentPosition" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_educationOnResume" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_educationOnResume_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_educationOnResume_B_index" ON "_educationOnResume"("B");

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_educationOnResume" ADD CONSTRAINT "_educationOnResume_A_fkey" FOREIGN KEY ("A") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_educationOnResume" ADD CONSTRAINT "_educationOnResume_B_fkey" FOREIGN KEY ("B") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
