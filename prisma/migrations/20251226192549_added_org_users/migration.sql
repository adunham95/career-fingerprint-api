/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."OrgDataAccessLevel" AS ENUM ('full', 'consented', 'none');

-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_orgID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_userID_fkey";

-- DropTable
DROP TABLE "public"."Client";

-- CreateTable
CREATE TABLE "public"."OrgUser" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "subscriptionType" TEXT NOT NULL DEFAULT 'user-managed',
    "dataAccess" "public"."OrgDataAccessLevel" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "OrgUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DataConsent" (
    "id" TEXT NOT NULL,
    "orgUserId" TEXT NOT NULL,
    "scope" TEXT[],
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "DataConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgUser_userId_orgId_key" ON "public"."OrgUser"("userId", "orgId");

-- AddForeignKey
ALTER TABLE "public"."OrgUser" ADD CONSTRAINT "OrgUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrgUser" ADD CONSTRAINT "OrgUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DataConsent" ADD CONSTRAINT "DataConsent_orgUserId_fkey" FOREIGN KEY ("orgUserId") REFERENCES "public"."OrgUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
