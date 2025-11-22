/*
  Warnings:

  - You are about to drop the `_thankYouNote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userID` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_thankYouNote" DROP CONSTRAINT "_thankYouNote_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_thankYouNote" DROP CONSTRAINT "_thankYouNote_B_fkey";

-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "userID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_thankYouNote";

-- CreateTable
CREATE TABLE "public"."_thankYouNoteRecipient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_thankYouNoteRecipient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_thankYouNoteRecipient_B_index" ON "public"."_thankYouNoteRecipient"("B");

-- CreateIndex
CREATE INDEX "Contact_userID_email_idx" ON "public"."Contact"("userID", "email");

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_thankYouNoteRecipient" ADD CONSTRAINT "_thankYouNoteRecipient_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_thankYouNoteRecipient" ADD CONSTRAINT "_thankYouNoteRecipient_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ThankYou"("id") ON DELETE CASCADE ON UPDATE CASCADE;
