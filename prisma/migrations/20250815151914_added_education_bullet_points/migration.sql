-- DropForeignKey
ALTER TABLE "public"."BulletPoint" DROP CONSTRAINT "BulletPoint_jobPositionID_fkey";

-- AlterTable
ALTER TABLE "public"."BulletPoint" ADD COLUMN     "educationID" TEXT,
ALTER COLUMN "jobPositionID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_educationID_fkey" FOREIGN KEY ("educationID") REFERENCES "public"."Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BulletPoint" ADD CONSTRAINT "BulletPoint_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "public"."JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
