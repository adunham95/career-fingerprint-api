import { PrismaClient } from '@prisma/client';
import { FeatureFlags } from '../src/utils/featureFlags';
const prisma = new PrismaClient();

async function main() {
  // Free Plan
  await prisma.plan.upsert({
    where: { key: 'free' },
    update: {},
    create: {
      name: 'Free',
      key: 'free',
      level: 0,
      priceCents: 0,
      interval: 'month',
      features: [FeatureFlags.CreateResumes],
      metadata: { resumeLimit: 1 },
    },
  });

  // Pro Plan
  await prisma.plan.upsert({
    where: { key: 'pro' },
    update: {},
    create: {
      name: 'Elevate',
      key: 'pro',
      level: 1,
      priceCents: 999,
      interval: 'month',
      features: [FeatureFlags.CreateResumes, FeatureFlags.ExportPDF],
      metadata: { resumeLimit: null },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
