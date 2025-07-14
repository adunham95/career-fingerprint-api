/*
  Warnings:

  - You are about to drop the column `jobApplicationId` on the `PrepAnswer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID,jobApplicationID,questionID]` on the table `PrepAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PrepAnswer" DROP CONSTRAINT "PrepAnswer_jobApplicationId_fkey";

-- DropIndex
DROP INDEX "PrepAnswer_userID_jobApplicationId_questionID_key";

-- AlterTable
ALTER TABLE "PrepAnswer" DROP COLUMN "jobApplicationId",
ADD COLUMN     "jobApplicationID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PrepAnswer_userID_jobApplicationID_questionID_key" ON "PrepAnswer"("userID", "jobApplicationID", "questionID");

-- AddForeignKey
ALTER TABLE "PrepAnswer" ADD CONSTRAINT "PrepAnswer_jobApplicationID_fkey" FOREIGN KEY ("jobApplicationID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
