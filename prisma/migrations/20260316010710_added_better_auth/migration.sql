/*
  Warnings:

  - A unique constraint covering the columns `[baId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "baId" TEXT;

-- CreateTable
CREATE TABLE "public"."ba_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ba_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ba_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ba_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ba_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ba_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ba_session_token_key" ON "public"."ba_session"("token");

-- CreateIndex
CREATE INDEX "ba_session_userId_idx" ON "public"."ba_session"("userId");

-- CreateIndex
CREATE INDEX "ba_account_userId_idx" ON "public"."ba_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ba_account_providerId_accountId_key" ON "public"."ba_account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "ba_verification_identifier_idx" ON "public"."ba_verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_baId_key" ON "public"."User"("baId");

-- AddForeignKey
ALTER TABLE "public"."ba_session" ADD CONSTRAINT "ba_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("baId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ba_account" ADD CONSTRAINT "ba_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("baId") ON DELETE CASCADE ON UPDATE CASCADE;
