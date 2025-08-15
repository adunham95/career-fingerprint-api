/*
  Warnings:

  - Made the column `resumeID` on table `JobOptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jobID` on table `JobOptions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."JobOptions" DROP CONSTRAINT "JobOptions_jobID_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobOptions" DROP CONSTRAINT "JobOptions_resumeID_fkey";

-- AlterTable
ALTER TABLE "public"."JobOptions" ADD COLUMN     "bulletPoints" TEXT[],
ALTER COLUMN "resumeID" SET NOT NULL,
ALTER COLUMN "jobID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."JobOptions" ADD CONSTRAINT "JobOptions_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobOptions" ADD CONSTRAINT "JobOptions_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "public"."JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
