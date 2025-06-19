-- DropForeignKey
ALTER TABLE "JobPosition" DROP CONSTRAINT "JobPosition_resumeID_fkey";

-- CreateTable
CREATE TABLE "JobOnResume" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT,
    "jobID" TEXT,

    CONSTRAINT "JobOnResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_visibleAchievements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_visibleAchievements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_visibleAchievements_B_index" ON "_visibleAchievements"("B");

-- AddForeignKey
ALTER TABLE "JobOnResume" ADD CONSTRAINT "JobOnResume_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOnResume" ADD CONSTRAINT "JobOnResume_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_B_fkey" FOREIGN KEY ("B") REFERENCES "JobOnResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
