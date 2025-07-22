/*
  Warnings:

  - You are about to drop the column `priceCentsYears` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "priceCentsYears",
ADD COLUMN     "priceCentsYear" INTEGER;
