-- DropForeignKey
ALTER TABLE "public"."VerifyToken" DROP CONSTRAINT "VerifyToken_userID_fkey";

-- AddForeignKey
ALTER TABLE "public"."VerifyToken" ADD CONSTRAINT "VerifyToken_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
