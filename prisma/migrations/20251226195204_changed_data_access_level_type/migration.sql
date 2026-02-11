/*
  Warnings:

  - The values [admin,member,client] on the enum `OrgDataAccessLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrgDataAccessLevel_new" AS ENUM ('full', 'consented', 'none');
ALTER TABLE "public"."OrgUser" ALTER COLUMN "dataAccess" TYPE "public"."OrgDataAccessLevel_new" USING ("dataAccess"::text::"public"."OrgDataAccessLevel_new");
ALTER TYPE "public"."OrgDataAccessLevel" RENAME TO "OrgDataAccessLevel_old";
ALTER TYPE "public"."OrgDataAccessLevel_new" RENAME TO "OrgDataAccessLevel";
DROP TYPE "public"."OrgDataAccessLevel_old";
COMMIT;

-- DropEnum
DROP TYPE "public"."OrgRole";
