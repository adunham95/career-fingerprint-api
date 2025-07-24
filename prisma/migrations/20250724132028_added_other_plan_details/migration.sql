-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "featureList" TEXT[];
