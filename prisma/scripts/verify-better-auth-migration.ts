import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBetterAuthMigration() {
  console.log('Verifying Better Auth migration...\n');

  let failed = false;

  // Check 1: Users with no baId
  const missingBaId = await prisma.user.count({
    where: { baId: null },
  });
  if (missingBaId > 0) {
    console.error(`FAIL: ${missingBaId} user(s) have no baId`);
    failed = true;
  } else {
    console.log('PASS: All users have a baId');
  }

  // Check 2: Users with no BaAccount
  const totalUsers = await prisma.user.count();
  const usersWithAccount = await prisma.baAccount.groupBy({
    by: ['userId'],
    _count: true,
  });
  const coveredUserIds = new Set(usersWithAccount.map((a) => a.userId));

  const allUsers = await prisma.user.findMany({
    select: { id: true, baId: true },
  });
  const uncovered = allUsers.filter(
    (u) => !u.baId || !coveredUserIds.has(u.baId),
  );

  if (uncovered.length > 0) {
    console.error(
      `FAIL: ${uncovered.length} user(s) have no BaAccount — ids: ${uncovered.map((u) => u.id).join(', ')}`,
    );
    failed = true;
  } else {
    console.log(`PASS: All ${totalUsers} users have a BaAccount`);
  }

  // Check 3: Credential accounts with missing password hash
  const credentialWithoutPassword = await prisma.baAccount.count({
    where: { providerId: 'credential', password: null },
  });
  if (credentialWithoutPassword > 0) {
    console.error(
      `FAIL: ${credentialWithoutPassword} credential BaAccount(s) have no password`,
    );
    failed = true;
  } else {
    console.log('PASS: All credential accounts have a password hash');
  }

  // Summary
  const totalAccounts = await prisma.baAccount.count();
  const credentialAccounts = await prisma.baAccount.count({
    where: { providerId: 'credential' },
  });
  const samlAccounts = await prisma.baAccount.count({
    where: { providerId: 'saml' },
  });

  console.log('\n--- Summary ---');
  console.log(`Total users:               ${totalUsers}`);
  console.log(`Total BaAccount rows:      ${totalAccounts}`);
  console.log(`  credential accounts:     ${credentialAccounts}`);
  console.log(`  saml accounts:           ${samlAccounts}`);

  if (failed) {
    console.error('\nVerification FAILED');
    process.exit(1);
  } else {
    console.log('\nVerification PASSED');
  }
}

verifyBetterAuthMigration()
  .catch((e) => {
    console.error('Verification error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
