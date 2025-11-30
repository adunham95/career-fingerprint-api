-- CreateTable
CREATE TABLE "public"."GoalSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT[],
    "actions" TEXT[],

    CONSTRAINT "GoalSkill_pkey" PRIMARY KEY ("id")
);
