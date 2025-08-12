-- AlterTable
ALTER TABLE "public"."CoverLetter" ADD COLUMN     "to" TEXT DEFAULT 'Hiring Manager';

-- CreateIndex
CREATE INDEX "CoverLetter_jobAppID_idx" ON "public"."CoverLetter"("jobAppID");
