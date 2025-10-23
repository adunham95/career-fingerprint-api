-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "hasOrgManagement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userKey" TEXT,
ALTER COLUMN "priceCents" DROP NOT NULL;
