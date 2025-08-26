/*
  Warnings:

  - You are about to drop the `_OrganizationAdmins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_OrganizationAdmins" DROP CONSTRAINT "_OrganizationAdmins_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_OrganizationAdmins" DROP CONSTRAINT "_OrganizationAdmins_B_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "orgId" TEXT;

-- DropTable
DROP TABLE "public"."_OrganizationAdmins";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
