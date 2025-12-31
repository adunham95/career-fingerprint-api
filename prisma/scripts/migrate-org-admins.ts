import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOrgAdmins() {
  if (process.env.RUN_ORG_ADMIN_MIGRATION !== 'true') {
    console.log('Org admin migration skipped');
    process.exit(0);
  }

  console.log('Starting org admin migration...');

  const admins = await prisma.organizationAdmin.findMany();

  console.log(`Found ${admins.length} org admins`);

  let created = 0;
  let skipped = 0;

  for (const admin of admins) {
    const exists = await prisma.orgUser.findFirst({
      where: {
        userId: admin.userId,
        orgId: admin.orgId,
      },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await prisma.orgUser.create({
      data: {
        userId: admin.userId,
        orgId: admin.orgId,
        roles: admin.roles,
        dataAccess: 'none',
        subscriptionType: 'user-managed',
        status: 'active',
        joinedAt: admin.createdAt,
      },
    });

    created++;
  }

  console.log(`Migration complete`);
  console.log(`Created: ${created}`);
  console.log(`Skipped (already existed): ${skipped}`);
}

migrateOrgAdmins()
  .catch((e) => {
    console.error('Migration failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
