/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "stripePriceID" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerID" TEXT;
