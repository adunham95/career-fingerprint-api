/*
  Warnings:

  - You are about to drop the column `verifyDomain` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `email` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Organization" DROP COLUMN "verifyDomain",
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "domainVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "stripeCustomerID" TEXT;
