-- CreateTable
CREATE TABLE "public"."Domain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "orgID" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_orgID_fkey" FOREIGN KEY ("orgID") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
