-- CreateTable
CREATE TABLE "public"."Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "keywords" TEXT[],
    "actions" TEXT[],
    "targetCount" INTEGER NOT NULL DEFAULT 5,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
