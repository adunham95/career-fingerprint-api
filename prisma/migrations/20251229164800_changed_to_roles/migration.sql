/*
  Warnings:

  - You are about to drop the column `role` on the `OrgUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."OrgUser_userId_role_status_idx";

-- AlterTable
ALTER TABLE "public"."OrgUser" DROP COLUMN "role",
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['viewer']::TEXT[];

-- CreateIndex
CREATE INDEX "OrgUser_userId_roles_status_idx" ON "public"."OrgUser"("userId", "roles", "status");
