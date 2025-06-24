/*
  Warnings:

  - You are about to drop the `_educationOnResume` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_educationOnResume" DROP CONSTRAINT "_educationOnResume_A_fkey";

-- DropForeignKey
ALTER TABLE "_educationOnResume" DROP CONSTRAINT "_educationOnResume_B_fkey";

-- AlterTable
ALTER TABLE "Education" ALTER COLUMN "startDate" DROP NOT NULL;

-- DropTable
DROP TABLE "_educationOnResume";
