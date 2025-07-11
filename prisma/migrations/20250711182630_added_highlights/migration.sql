-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "highlightID" TEXT;

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_highlightAchievements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_highlightAchievements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_highlightAchievements_B_index" ON "_highlightAchievements"("B");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_highlightID_fkey" FOREIGN KEY ("highlightID") REFERENCES "Highlight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_highlightAchievements" ADD CONSTRAINT "_highlightAchievements_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_highlightAchievements" ADD CONSTRAINT "_highlightAchievements_B_fkey" FOREIGN KEY ("B") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
