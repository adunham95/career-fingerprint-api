/*
  Warnings:

  - A unique constraint covering the columns `[resumeID,jobID]` on the table `JobOptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobOptions_resumeID_jobID_key" ON "public"."JobOptions"("resumeID", "jobID");
