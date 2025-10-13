-- DropForeignKey
ALTER TABLE "public"."ResumeObject" DROP CONSTRAINT "ResumeObject_eduID_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResumeObject" DROP CONSTRAINT "ResumeObject_jobID_fkey";

-- AlterTable
ALTER TABLE "public"."ResumeObject" ALTER COLUMN "jobID" DROP NOT NULL,
ALTER COLUMN "eduID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ResumeObject" ADD CONSTRAINT "ResumeObject_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "public"."JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResumeObject" ADD CONSTRAINT "ResumeObject_eduID_fkey" FOREIGN KEY ("eduID") REFERENCES "public"."Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;
