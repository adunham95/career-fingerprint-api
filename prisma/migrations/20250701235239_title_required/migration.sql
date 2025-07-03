/*
  Warnings:

  - Made the column `title` on table `JobApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobApplication" ALTER COLUMN "title" SET NOT NULL;
