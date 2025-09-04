-- DropIndex
DROP INDEX "public"."User_email_idx";

-- AlterTable
ALTER TABLE "public"."Resume" ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "public"."Skills" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "skillList" TEXT[],
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skills_userID_key" ON "public"."Skills"("userID");

-- CreateIndex
CREATE INDEX "Skills_userID_idx" ON "public"."Skills"("userID");

-- CreateIndex
CREATE INDEX "Achievement_userID_idx" ON "public"."Achievement"("userID");

-- CreateIndex
CREATE INDEX "Education_userID_idx" ON "public"."Education"("userID");

-- CreateIndex
CREATE INDEX "Highlight_userID_meetingID_idx" ON "public"."Highlight"("userID", "meetingID");

-- CreateIndex
CREATE INDEX "JobApplication_userID_idx" ON "public"."JobApplication"("userID");

-- CreateIndex
CREATE INDEX "Meeting_jobAppID_jobPositionID_idx" ON "public"."Meeting"("jobAppID", "jobPositionID");

-- CreateIndex
CREATE INDEX "Note_userID_meetingID_highlightID_idx" ON "public"."Note"("userID", "meetingID", "highlightID");

-- CreateIndex
CREATE INDEX "Organization_email_stripeCustomerID_idx" ON "public"."Organization"("email", "stripeCustomerID");

-- CreateIndex
CREATE INDEX "User_email_inviteCode_stripeCustomerID_idx" ON "public"."User"("email", "inviteCode", "stripeCustomerID");

-- AddForeignKey
ALTER TABLE "public"."Skills" ADD CONSTRAINT "Skills_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
