-- CreateTable
CREATE TABLE "public"."OrgWeeklyReport" (
    "id" TEXT NOT NULL,
    "orgID" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "totalAchievements" INTEGER NOT NULL DEFAULT 0,
    "avgAchievementsPerUser" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topTags" JSONB NOT NULL,
    "topEmployers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgWeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgWeeklyReport_orgID_weekStart_idx" ON "public"."OrgWeeklyReport"("orgID", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "OrgWeeklyReport_orgID_weekStart_key" ON "public"."OrgWeeklyReport"("orgID", "weekStart");

-- AddForeignKey
ALTER TABLE "public"."OrgWeeklyReport" ADD CONSTRAINT "OrgWeeklyReport_orgID_fkey" FOREIGN KEY ("orgID") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
