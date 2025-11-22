-- CreateTable
CREATE TABLE "public"."ThankYou" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "meetingID" TEXT,

    CONSTRAINT "ThankYou_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_meetingContact" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_meetingContact_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_thankYouNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_thankYouNote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_meetingContact_B_index" ON "public"."_meetingContact"("B");

-- CreateIndex
CREATE INDEX "_thankYouNote_B_index" ON "public"."_thankYouNote"("B");

-- AddForeignKey
ALTER TABLE "public"."ThankYou" ADD CONSTRAINT "ThankYou_meetingID_fkey" FOREIGN KEY ("meetingID") REFERENCES "public"."Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_meetingContact" ADD CONSTRAINT "_meetingContact_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_meetingContact" ADD CONSTRAINT "_meetingContact_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_thankYouNote" ADD CONSTRAINT "_thankYouNote_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_thankYouNote" ADD CONSTRAINT "_thankYouNote_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ThankYou"("id") ON DELETE CASCADE ON UPDATE CASCADE;
