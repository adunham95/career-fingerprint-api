/*
  Warnings:

  - You are about to drop the column `adminSeats` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "adminSeats",
ADD COLUMN     "maxAdminSeats" INTEGER DEFAULT 1;
