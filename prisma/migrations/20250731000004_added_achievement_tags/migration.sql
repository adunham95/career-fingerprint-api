-- CreateTable
CREATE TABLE "public"."AchievementTag" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AchievementTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_achievementTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_achievementTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "AchievementTag_name_idx" ON "public"."AchievementTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementTag_userID_name_key" ON "public"."AchievementTag"("userID", "name");

-- CreateIndex
CREATE INDEX "_achievementTags_B_index" ON "public"."_achievementTags"("B");

-- AddForeignKey
ALTER TABLE "public"."AchievementTag" ADD CONSTRAINT "AchievementTag_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_achievementTags" ADD CONSTRAINT "_achievementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_achievementTags" ADD CONSTRAINT "_achievementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."AchievementTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
