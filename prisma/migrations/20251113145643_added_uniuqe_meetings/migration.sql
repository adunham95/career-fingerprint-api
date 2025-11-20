/*
  Warnings:

  - A unique constraint covering the columns `[meetingID]` on the table `ThankYou` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ThankYou_meetingID_key" ON "public"."ThankYou"("meetingID");
