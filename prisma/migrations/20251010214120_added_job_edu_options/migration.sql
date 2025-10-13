/*
  Warnings:

  - You are about to drop the `JobOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."JobOptions" DROP CONSTRAINT "JobOptions_jobID_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobOptions" DROP CONSTRAINT "JobOptions_resumeID_fkey";

-- DropForeignKey
ALTER TABLE "public"."_visibleAchievements" DROP CONSTRAINT "_visibleAchievements_B_fkey";

-- AlterTable
ALTER TABLE "public"."BulletPoint" ADD COLUMN     "eduOptionID" TEXT,
ADD COLUMN     "jobOptionID" TEXT;

-- DropTable
DROP TABLE "public"."JobOptions";

-- CreateTable
CREATE TABLE "public"."JobOption" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT NOT NULL,
    "jobID" TEXT NOT NULL,
    "jobOverwrites" JSONB,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "JobOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EduOption" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT NOT NULL,
    "eduID" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "EduOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOption_resumeID_jobID_idx" ON "public"."JobOption"("resumeID", "jobID");

-- CreateIndex
CREATE UNIQUE INDEX "JobOption_resumeID_jobID_key" ON "public"."JobOption"("resumeID", "jobID");

-- CreateIndex
CREATE INDEX "EduOption_resumeID_eduID_idx" ON "public"."EduOption"("resumeID", "eduID");

-- CreateIndex
CREATE UNIQUE INDEX "EduOption_resumeID_eduID_key" ON "public"."EduOption"("resumeID", "eduID");

-- AddForeignKey
ALTER TABLE "public"."JobOption" ADD CONSTRAINT "JobOption_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobOption" ADD CONSTRAINT "JobOption_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "public"."JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EduOption" ADD CONSTRAINT "EduOption_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EduOption" ADD CONSTRAINT "EduOption_eduID_fkey" FOREIGN KEY ("eduID") REFERENCES "public"."Education"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_jobOptionID_fkey" FOREIGN KEY ("jobOptionID") REFERENCES "public"."JobOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_eduOptionID_fkey" FOREIGN KEY ("eduOptionID") REFERENCES "public"."EduOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."JobOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
