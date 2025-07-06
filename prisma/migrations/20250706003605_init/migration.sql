-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "username" TEXT,
    "password" TEXT NOT NULL,
    "profileImage" TEXT DEFAULT '',
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'active',
    "pitch" TEXT,
    "lookingFor" TEXT,
    "stripeCustomerID" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "level" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "interval" TEXT NOT NULL,
    "features" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stripePriceID" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "planID" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'trialing',
    "stripeSubId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_events" (
    "id" TEXT NOT NULL,
    "subscriptionID" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'created',
    "fromStatus" "SubscriptionStatus",
    "toStatus" "SubscriptionStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "linkedin" TEXT NOT NULL DEFAULT '',
    "github" TEXT NOT NULL DEFAULT '',
    "title" TEXT,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOptions" (
    "id" TEXT NOT NULL,
    "resumeID" TEXT,
    "jobID" TEXT,
    "jobOverwrites" JSONB,

    CONSTRAINT "JobOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currentPosition" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "happened" TEXT,
    "level" INTEGER DEFAULT 3,
    "myContribution" TEXT,
    "projectID" TEXT,
    "jobPositionID" TEXT,
    "educationID" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobPositionID" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institution" TEXT NOT NULL DEFAULT '',
    "degree" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currentPosition" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "companyURL" TEXT,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "location" TEXT,
    "jobDescriptionURL" TEXT,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobAppID" TEXT,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "jobApplicationID" TEXT,
    "interviewID" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_visibleAchievements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_visibleAchievements_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE INDEX "Plan_key_idx" ON "Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_stripeId_key" ON "webhook_events"("stripeId");

-- CreateIndex
CREATE INDEX "_visibleAchievements_B_index" ON "_visibleAchievements"("B");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planID_fkey" FOREIGN KEY ("planID") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscriptionID_fkey" FOREIGN KEY ("subscriptionID") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOptions" ADD CONSTRAINT "JobOptions_resumeID_fkey" FOREIGN KEY ("resumeID") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOptions" ADD CONSTRAINT "JobOptions_jobID_fkey" FOREIGN KEY ("jobID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_educationID_fkey" FOREIGN KEY ("educationID") REFERENCES "Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_jobPositionID_fkey" FOREIGN KEY ("jobPositionID") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobAppID_fkey" FOREIGN KEY ("jobAppID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_jobApplicationID_fkey" FOREIGN KEY ("jobApplicationID") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_interviewID_fkey" FOREIGN KEY ("interviewID") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_visibleAchievements" ADD CONSTRAINT "_visibleAchievements_B_fkey" FOREIGN KEY ("B") REFERENCES "JobOptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
