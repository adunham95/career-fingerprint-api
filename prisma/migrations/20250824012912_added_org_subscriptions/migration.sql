-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userID_fkey";

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "orgID" TEXT,
ALTER COLUMN "userID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_orgID_fkey" FOREIGN KEY ("orgID") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
