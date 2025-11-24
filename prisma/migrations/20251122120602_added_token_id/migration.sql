/*
  Warnings:

  - The primary key for the `LoginToken` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."LoginToken" DROP CONSTRAINT "LoginToken_pkey",
ADD CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("token");
