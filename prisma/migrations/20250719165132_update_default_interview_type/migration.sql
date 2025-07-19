/*
  Warnings:

  - You are about to drop the column `educationID` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `jobAppID` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `jobPositionID` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_educationID_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_jobAppID_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_jobPositionID_fkey";

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "type" SET DEFAULT 'Interview';

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "educationID",
DROP COLUMN "jobAppID",
DROP COLUMN "jobPositionID";
