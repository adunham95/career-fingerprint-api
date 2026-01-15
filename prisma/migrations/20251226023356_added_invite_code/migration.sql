/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Invite" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteCode" TEXT NOT NULL,
ADD COLUMN     "usedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_inviteCode_key" ON "public"."Invite"("inviteCode");
