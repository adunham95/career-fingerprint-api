-- DropIndex
DROP INDEX "public"."Meeting_jobAppID_jobPositionID_idx";

-- CreateIndex
CREATE INDEX "Meeting_jobAppID_jobPositionID_status_idx" ON "public"."Meeting"("jobAppID", "jobPositionID", "status");
