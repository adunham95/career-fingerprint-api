-- CreateTable
CREATE TABLE "PrepQuestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question" TEXT NOT NULL,
    "displayOn" TEXT[],

    CONSTRAINT "PrepQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepAnswer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "questionID" TEXT NOT NULL,
    "jobApplicationId" TEXT,

    CONSTRAINT "PrepAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrepAnswer" ADD CONSTRAINT "PrepAnswer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepAnswer" ADD CONSTRAINT "PrepAnswer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "PrepQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepAnswer" ADD CONSTRAINT "PrepAnswer_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
