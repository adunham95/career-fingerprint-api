-- CreateIndex
CREATE INDEX "Subscription_planID_stripeSubId_stripeSessionID_idx" ON "public"."Subscription"("planID", "stripeSubId", "stripeSessionID");
