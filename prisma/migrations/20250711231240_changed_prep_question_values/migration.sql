/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `PrepQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `PrepQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PrepQuestion_question_key";

-- AlterTable
ALTER TABLE "PrepQuestion" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 99;

-- CreateIndex
CREATE UNIQUE INDEX "PrepQuestion_key_key" ON "PrepQuestion"("key");
