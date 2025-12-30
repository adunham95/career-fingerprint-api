import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOrgAdmins() {
  if (process.env.RUN_ORG_ADMIN_MIGRATION !== 'true') {
    console.log('Org admin migration skipped');
    process.exit(0);
  }

  console.log('Starting org user migration...');

  const users = await prisma.subscription.findMany({
    where: { status: 'org-managed' },
  });

  console.log(`Found ${users.length} org users`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    if (user.userID && user.managedByID) {
      const exists = await prisma.orgUser.findFirst({
        where: {
          userId: user.userID,
          orgId: user.managedByID,
        },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.orgUser.create({
        data: {
          userId: user.userID,
          orgId: user.managedByID,
          roles: ['member'],
          dataAccess: 'full',
          subscriptionType: 'org-managed',
          status: 'active',
          joinedAt: user.createdAt,
        },
      });

      created++;
    } else {
      skipped++;
      continue;
    }
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
