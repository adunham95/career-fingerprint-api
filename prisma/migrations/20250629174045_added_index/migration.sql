/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE INDEX "Plan_key_idx" ON "Plan"("key");
