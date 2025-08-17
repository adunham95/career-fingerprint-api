-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "inviteCode" TEXT;

-- CreateTable
CREATE TABLE "public"."InviteRedemption" (
    "id" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "source" TEXT DEFAULT 'unknown',
    "inviterUserId" INTEGER NOT NULL,
    "inviteeUserId" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteRedemption_inviterUserId_inviteeUserId_key" ON "public"."InviteRedemption"("inviterUserId", "inviteeUserId");

-- AddForeignKey
ALTER TABLE "public"."InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviteeUserId_fkey" FOREIGN KEY ("inviteeUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
