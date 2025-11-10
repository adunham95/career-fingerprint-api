/*
  Warnings:

  - You are about to drop the column `orgID` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_orgID_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "orgID";

-- CreateTable
CREATE TABLE "public"."OrganizationAdmin" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['viewer']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAdmin_userId_orgId_key" ON "public"."OrganizationAdmin"("userId", "orgId");

-- AddForeignKey
ALTER TABLE "public"."OrganizationAdmin" ADD CONSTRAINT "OrganizationAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationAdmin" ADD CONSTRAINT "OrganizationAdmin_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
