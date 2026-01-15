/*
  Warnings:

  - The values [full,consented,none] on the enum `OrgDataAccessLevel` will be removed. If these variants are still used in the database, this will fail.
  - The `role` column on the `OrgUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."OrgRole" AS ENUM ('full', 'consented', 'none');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrgDataAccessLevel_new" AS ENUM ('admin', 'member', 'client');
ALTER TABLE "public"."OrgUser" ALTER COLUMN "dataAccess" TYPE "public"."OrgDataAccessLevel_new" USING ("dataAccess"::text::"public"."OrgDataAccessLevel_new");
ALTER TYPE "public"."OrgDataAccessLevel" RENAME TO "OrgDataAccessLevel_old";
ALTER TYPE "public"."OrgDataAccessLevel_new" RENAME TO "OrgDataAccessLevel";
DROP TYPE "public"."OrgDataAccessLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."OrgUser" DROP COLUMN "role",
ADD COLUMN     "role" TEXT[] DEFAULT ARRAY['viewer']::TEXT[];

-- CreateIndex
CREATE INDEX "OrgUser_userId_role_status_idx" ON "public"."OrgUser"("userId", "role", "status");
