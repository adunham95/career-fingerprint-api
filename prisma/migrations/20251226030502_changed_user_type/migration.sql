/*
  Warnings:

  - Changed the type of `createdByID` on the `OrgInviteCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."OrgInviteCode" DROP COLUMN "createdByID",
ADD COLUMN     "createdByID" INTEGER NOT NULL;
