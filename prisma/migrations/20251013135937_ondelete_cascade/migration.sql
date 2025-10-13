-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_resumeObjectID_fkey";

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_resumeObjectID_fkey" FOREIGN KEY ("resumeObjectID") REFERENCES "public"."ResumeObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
