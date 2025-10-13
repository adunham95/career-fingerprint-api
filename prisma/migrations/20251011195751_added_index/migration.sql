-- DropIndex
DROP INDEX "public"."BulletPoint_text_resumeID_idx";

-- CreateIndex
CREATE INDEX "BulletPoint_text_resumeID_jobOptionID_eduOptionID_idx" ON "public"."BulletPoint"("text", "resumeID", "jobOptionID", "eduOptionID");
