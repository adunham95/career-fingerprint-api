/*
  Warnings:

  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Invite" DROP CONSTRAINT "Invite_orgID_fkey";

-- DropTable
DROP TABLE "public"."Invite";

-- CreateTable
CREATE TABLE "public"."OrgInviteCode" (
    "id" TEXT NOT NULL,
    "orgID" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdByID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgInviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgInviteCode_code_key" ON "public"."OrgInviteCode"("code");

-- AddForeignKey
ALTER TABLE "public"."OrgInviteCode" ADD CONSTRAINT "OrgInviteCode_orgID_fkey" FOREIGN KEY ("orgID") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
