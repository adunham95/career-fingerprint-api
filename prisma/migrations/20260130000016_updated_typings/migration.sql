/*
  Warnings:

  - Changed the type of `kind` on the `Evidence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Evidence" DROP COLUMN "kind",
ADD COLUMN     "kind" "public"."MilestoneKind" NOT NULL;

-- DropEnum
DROP TYPE "public"."EvidenceKind";

-- CreateIndex
CREATE INDEX "Evidence_milestoneID_kind_idx" ON "public"."Evidence"("milestoneID", "kind");

-- CreateIndex
CREATE INDEX "Evidence_userID_kind_idx" ON "public"."Evidence"("userID", "kind");
