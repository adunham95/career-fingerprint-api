import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'Free',
        key: 'free',
        level: 0,
        priceCents: 0,
        interval: 'month',
        features: [],
      },
      {
        name: 'Elevate',
        key: 'elevate',
        level: 1,
        priceCents: 999,
        interval: 'month',
        features: [],
      },
    ],
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
