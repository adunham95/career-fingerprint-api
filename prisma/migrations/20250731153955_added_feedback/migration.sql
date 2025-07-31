-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "contact" BOOLEAN NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
