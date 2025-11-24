-- CreateTable
CREATE TABLE "public"."LoginToken" (
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("token","email")
);

-- AddForeignKey
ALTER TABLE "public"."LoginToken" ADD CONSTRAINT "LoginToken_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
