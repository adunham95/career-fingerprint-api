/*
  Warnings:

  - Added the required column `answer` to the `PrepAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PrepAnswer" ADD COLUMN     "answer" TEXT NOT NULL;
