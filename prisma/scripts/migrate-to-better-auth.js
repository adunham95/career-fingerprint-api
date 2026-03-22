import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const BATCH_SIZE = 100;

async function migrateToBetterAuth() {
  if (process.env.RUN_BETTER_AUTH_MIGRATION !== 'true') {
    console.log(
      'Better Auth migration skipped. Set RUN_BETTER_AUTH_MIGRATION=true to run.',
    );
    process.exit(0);
  }

  console.log('Starting Better Auth migration...');

  // -------------------------------------------------------------------------
  // Phase 1: Backfill baId on existing users
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 1: Backfill baId ---');

  const usersWithoutBaId = await prisma.user.findMany({
    where: { baId: null },
    select: { id: true },
  });

  console.log(`Users missing baId: ${usersWithoutBaId.length}`);

  let baIdUpdated = 0;
  for (const user of usersWithoutBaId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { baId: uuidv4() },
    });
    baIdUpdated++;
  }

  console.log(`baId backfilled: ${baIdUpdated}`);

  // -------------------------------------------------------------------------
  // Phase 2: Create BaAccount rows for each user
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 2: Create BaAccount rows ---');

  const totalUsers = await prisma.user.count();
  console.log(`Total users: ${totalUsers}`);

  let created = 0;
  let skipped = 0;
  let offset = 0;

  while (offset < totalUsers) {
    const users = await prisma.user.findMany({
      skip: offset,
      take: BATCH_SIZE,
      select: {
        id: true,
        email: true,
        password: true,
        baId: true,
      },
    });

    for (const user of users) {
      if (!user.baId) {
        console.warn(`User ${user.id} still has no baId — skipping`);
        skipped++;
        continue;
      }

      const existing = await prisma.baAccount.findFirst({
        where: { userId: user.baId },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const isBcrypt =
        user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
      const isEmpty = user.password === '';

      const now = new Date();

      await prisma.baAccount.create({
        data: {
          id: uuidv4(),
          accountId: user.email,
          providerId: isEmpty ? 'saml' : 'credential',
          userId: user.baId,
          password: isBcrypt ? user.password : null,
          createdAt: now,
          updatedAt: now,
        },
      });

      created++;
    }

    offset += BATCH_SIZE;
    console.log(`Processed ${Math.min(offset, totalUsers)} / ${totalUsers}`);
  }

  console.log('\nMigration complete');
  console.log(`baId backfilled: ${baIdUpdated}`);
  console.log(`BaAccount rows created: ${created}`);
  console.log(`Skipped (already existed): ${skipped}`);
}

migrateToBetterAuth()
  .catch((e) => {
    console.error('Migration failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
