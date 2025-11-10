-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "ssoCert" TEXT,
ADD COLUMN     "ssoEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ssoEntryPoint" TEXT,
ADD COLUMN     "ssoIssuer" TEXT;
