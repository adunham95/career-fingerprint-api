/*
  Warnings:

  - You are about to drop the column `benefit` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `impact` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `who` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the `_PositionOnResumes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PositionOnResumes" DROP CONSTRAINT "_PositionOnResumes_A_fkey";

-- DropForeignKey
ALTER TABLE "_PositionOnResumes" DROP CONSTRAINT "_PositionOnResumes_B_fkey";

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "benefit",
DROP COLUMN "customer",
DROP COLUMN "impact",
DROP COLUMN "who",
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "metrics" TEXT,
ADD COLUMN     "myContribution" TEXT,
ADD COLUMN     "projectID" TEXT,
ADD COLUMN     "result" TEXT,
ADD COLUMN     "visibleOnResume" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "JobPosition" ADD COLUMN     "resumeID" TEXT;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "name",
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "github" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkedin" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "summary" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "website" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pitch" TEXT;

-- DropTable
DROP TABLE "_PositionOnResumes";

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
