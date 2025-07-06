/*
  Warnings:

  - You are about to drop the column `happened` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Achievement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "happened",
DROP COLUMN "level",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "result" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "description" DROP NOT NULL;
