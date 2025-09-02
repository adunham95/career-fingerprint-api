-- CreateTable
CREATE TABLE "public"."_OrgAdmins" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OrgAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrgAdmins_B_index" ON "public"."_OrgAdmins"("B");

-- AddForeignKey
ALTER TABLE "public"."_OrgAdmins" ADD CONSTRAINT "_OrgAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrgAdmins" ADD CONSTRAINT "_OrgAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
