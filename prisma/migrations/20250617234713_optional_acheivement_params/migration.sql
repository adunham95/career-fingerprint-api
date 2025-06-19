-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_jobPositionID_fkey";

-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "impact" DROP NOT NULL,
ALTER COLUMN "customer" DROP NOT NULL,
ALTER COLUMN "benefit" DROP NOT NULL,
ALTER COLUMN "who" DROP NOT NULL,
ALTER COLUMN "jobPositionID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
