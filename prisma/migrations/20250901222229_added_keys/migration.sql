/*
  Warnings:

  - A unique constraint covering the columns `[domain,orgID]` on the table `Domain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Domain_domain_idx" ON "public"."Domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domain_orgID_key" ON "public"."Domain"("domain", "orgID");
