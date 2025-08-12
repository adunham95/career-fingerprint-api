/*
  Warnings:

  - You are about to drop the column `note` on the `CoverLetter` table. All the data in the column will be lost.
  - Added the required column `message` to the `CoverLetter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CoverLetter" DROP COLUMN "note",
ADD COLUMN     "message" TEXT NOT NULL;
