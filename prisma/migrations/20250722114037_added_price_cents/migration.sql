/*
  Warnings:

  - You are about to drop the column `stripePriceID` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "stripePriceID",
ADD COLUMN     "annualStripePriceID" TEXT,
ADD COLUMN     "monthlyStripePriceID" TEXT,
ADD COLUMN     "priceCentsYears" INTEGER;
