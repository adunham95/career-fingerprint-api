-- CreateTable
CREATE TABLE "public"."CoverLetter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "jobAppID" TEXT,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoverLetter_jobAppID_key" ON "public"."CoverLetter"("jobAppID");

-- AddForeignKey
ALTER TABLE "public"."CoverLetter" ADD CONSTRAINT "CoverLetter_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoverLetter" ADD CONSTRAINT "CoverLetter_jobAppID_fkey" FOREIGN KEY ("jobAppID") REFERENCES "public"."JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
