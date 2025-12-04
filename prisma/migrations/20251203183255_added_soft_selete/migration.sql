-- AlterTable
ALTER TABLE "public"."Education" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedById" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."JobPosition" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedById" INTEGER,
ADD COLUMN     "status" TEXT DEFAULT 'active';
