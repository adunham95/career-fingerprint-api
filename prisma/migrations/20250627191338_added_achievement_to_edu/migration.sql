-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "educationID" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "name" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_educationID_fkey" FOREIGN KEY ("educationID") REFERENCES "Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;
