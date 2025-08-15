/*
  Warnings:

  - You are about to drop the column `bulletPoints` on the `JobOptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."JobOptions" DROP COLUMN "bulletPoints";

-- CreateTable
CREATE TABLE "public"."BulletPoint" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "jobPositionID" TEXT NOT NULL,
    "resumeID" TEXT NOT NULL,

    CONSTRAINT "BulletPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulletPoint_text_resumeID_idx" ON "public"."BulletPoint"("text", "resumeID");

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "public"."JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_jobPositionID_resumeID_fkey" FOREIGN KEY ("jobPositionID", "resumeID") REFERENCES "public"."JobOptions"("jobID", "resumeID") ON DELETE RESTRICT ON UPDATE CASCADE;
