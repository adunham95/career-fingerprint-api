import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    key: 'free',
    level: 0,
    name: 'Free',
    priceCents: 0,
    interval: 'month',
    priceCentsYear: 0,
    description:
      'Perfect for job seekers who want a smarter way to organize and track their career progress',
    featureList: [
      'Add Achievements',
      'Schedule Jobs',
      'Track Job Applications',
    ],
  },
  {
    key: 'pro-beta',
    level: 1,
    name: 'Premium',
    priceCents: 699,
    interval: 'month',
    priceCentsYear: 6999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
  },
  {
    key: 'pro-edu',
    level: 1,
    name: 'Premium',
    priceCents: 699,
    interval: 'month',
    priceCentsYear: 6999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
  },
  {
    key: 'pro',
    level: 1,
    name: 'Premium',
    priceCents: 999,
    interval: 'month',
    priceCentsYear: 9999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
  },
  {
    key: 'organization',
    level: 3,
    name: 'Organization',
    priceCents: 1000,
    interval: 'per 100',
    description:
      'For organizations to provide subscriptions to large organizations of people',
    featureList: ['People Management', 'Subscription Management'],
  },
  {
    key: 'org-premium',
    level: 3,
    name: 'Organization Premium',
    priceCents: 0,
    interval: 'Selected',
    description:
      'For organizations to provide premium subscriptions to large organizations of peopled.',
    featureList: ['People Management', 'Subscription Management'],
    userKey: 'pro',
  },
  {
    key: 'org-basic',
    level: 3,
    name: 'Organization',
    priceCents: 0,
    interval: 'Selected',
    description:
      'For organizations to provide subscriptions to large organizations of peopled. ',
    featureList: ['People Management', 'Subscription Management'],
    userKey: 'free',
  },
];

async function main() {
  console.log('Seeding plans…');

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { key: plan.key }, // must have unique constraint on "key"
      update: {
        key: plan.key,
        level: plan.level,
        name: plan.name,
        priceCents: plan.priceCents,
        interval: plan.interval,
        priceCentsYear: plan.priceCentsYear,
        description: plan.description,
        featureList: plan.featureList,
        userKey: plan.userKey,
      },
      create: plan,
    });
  }

  console.log('✅ Plans loaded / updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
