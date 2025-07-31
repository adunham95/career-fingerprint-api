/*
  Warnings:

  - Added the required column `color` to the `AchievementTag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AchievementTag" ADD COLUMN     "color" TEXT NOT NULL;
