-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'trialing';

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "companyURL" TEXT,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "location" TEXT,
    "jobDescriptionURL" TEXT,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
