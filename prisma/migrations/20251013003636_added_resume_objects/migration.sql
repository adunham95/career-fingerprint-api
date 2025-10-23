/*
  Warnings:

  - You are about to drop the column `eduOptionID` on the `BulletPoint` table. All the data in the column will be lost.
  - You are about to drop the column `educationID` on the `BulletPoint` table. All the data in the column will be lost.
  - You are about to drop the column `jobOptionID` on the `BulletPoint` table. All the data in the column will be lost.
  - You are about to drop the column `jobPositionID` on the `BulletPoint` table. All the data in the column will be lost.
  - You are about to drop the column `resumeID` on the `BulletPoint` table. All the data in the column will be lost.
  - You are about to drop the `EduOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_visibleAchievements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resumeObjectID` to the `BulletPoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_eduOptionID_fkey";

-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_educationID_fkey";

-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_jobOptionID_fkey";

-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_jobPositionID_fkey";

-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_resumeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."EduOption" DROP CONSTRAINT "EduOption_eduID_fkey";

-- DropForeignKey
ALTER TABLE "public"."EduOption" DROP CONSTRAINT "EduOption_resumeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobOption" DROP CONSTRAINT "JobOption_jobID_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobOption" DROP CONSTRAINT "JobOption_resumeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."_visibleAchievements" DROP CONSTRAINT "_visibleAchievements_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_visibleAchievements" DROP CONSTRAINT "_visibleAchievements_B_fkey";

-- DropIndex
DROP INDEX "public"."BulletPoint_text_resumeID_jobOptionID_eduOptionID_idx";

-- AlterTable
ALTER TABLE "public"."BulletPoint" DROP COLUMN "eduOptionID",
DROP COLUMN "educationID",
DROP COLUMN "jobOptionID",
DROP COLUMN "jobPositionID",
DROP COLUMN "resumeID",
ADD COLUMN "resumeObjectID" TEXT NULL;

-- DropTable
DROP TABLE "public"."EduOption";

-- DropTable
DROP TABLE "public"."JobOption";

-- DropTable
DROP TABLE "public"."_visibleAchievements";

-- CreateTable
CREATE TABLE "public"."ResumeObject" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT NOT NULL,
    "jobID" TEXT NOT NULL,
    "eduID" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ResumeObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeObject_resumeID_jobID_eduID_idx" ON "public"."ResumeObject"("resumeID", "jobID", "eduID");

-- CreateIndex
CREATE INDEX "BulletPoint_text_idx" ON "public"."BulletPoint"("text");

-- AddForeignKey
ALTER TABLE "public"."ResumeObject" ADD CONSTRAINT "ResumeObject_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResumeObject" ADD CONSTRAINT "ResumeObject_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "public"."JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResumeObject" ADD CONSTRAINT "ResumeObject_eduID_fkey" FOREIGN KEY ("eduID") REFERENCES "public"."Education"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_resumeObjectID_fkey" FOREIGN KEY ("resumeObjectID") REFERENCES "public"."ResumeObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
