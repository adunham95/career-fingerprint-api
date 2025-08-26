/*
  Warnings:

  - You are about to drop the column `orgId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "orgId",
ADD COLUMN     "orgID" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_orgID_fkey" FOREIGN KEY ("orgID") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
