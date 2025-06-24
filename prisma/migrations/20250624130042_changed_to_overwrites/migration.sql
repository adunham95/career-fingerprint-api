/*
  Warnings:

  - You are about to drop the `JobOnResume` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobOnResume" DROP CONSTRAINT "JobOnResume_jobID_fkey";

-- DropForeignKey
ALTER TABLE "JobOnResume" DROP CONSTRAINT "JobOnResume_resumeID_fkey";

-- DropForeignKey
ALTER TABLE "_visibleAchievements" DROP CONSTRAINT "_visibleAchievements_B_fkey";

-- DropTable
DROP TABLE "JobOnResume";

-- CreateTable
CREATE TABLE "JobOptions" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT,
    "jobID" TEXT,
    "jobOverwrites" JSONB,

    CONSTRAINT "JobOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobOptions" ADD CONSTRAINT "JobOptions_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOptions" ADD CONSTRAINT "JobOptions_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_B_fkey" FOREIGN KEY ("B") REFERENCES "JobOptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
