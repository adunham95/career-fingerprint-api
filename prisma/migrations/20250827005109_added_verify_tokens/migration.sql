-- CreateTable
CREATE TABLE "public"."VerifyToken" (
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "VerifyToken_pkey" PRIMARY KEY ("token","userID")
);

-- AddForeignKey
ALTER TABLE "public"."VerifyToken" ADD CONSTRAINT "VerifyToken_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
