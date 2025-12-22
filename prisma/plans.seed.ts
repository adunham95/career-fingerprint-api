import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    key: 'free',
    level: 1,
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
    type: 'user',
  },
  {
    key: 'pro-beta',
    level: 2,
    name: 'Premium',
    priceCents: 799,
    interval: 'month',
    priceCentsYear: 7999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
    type: 'user',
  },
  {
    key: 'pro-edu',
    level: 2,
    name: 'Premium',
    priceCents: 299,
    interval: 'month',
    priceCentsYear: 2999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
    type: 'user',
  },
  {
    key: 'pro',
    level: 2,
    name: 'Premium',
    priceCents: 799,
    interval: 'month',
    priceCentsYear: 7999,
    description: 'For people who want to elevate there career',
    featureList: [
      'Meeting Cheat Sheet',
      'Meeting Prep',
      'Reminder Achievement Emails',
    ],
    type: 'user',
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
    type: 'org',
    maxAdminSeats: 100,
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
    type: 'org',
    maxAdminSeats: 100,
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
    type: 'org',
    maxAdminSeats: 100,
  },
  {
    key: 'coach-starter',
    level: 3,
    name: 'Coach Starter',
    description:
      'Everything a solo coach needs to manage clients simply and professionally.',
    priceCents: 1499,
    priceCentsSeats: 600,
    interval: 'Month',
    featureList: ['People Management', 'Subscription Management'],
    userKey: 'pro',
    features: ['org:createPromoCode'],
    hasMeteredSeats: true,
    type: 'coach',
    maxAdminSeats: 1,
    maxSeats: 20,
  },
  {
    key: 'coach-growth',
    level: 3,
    name: 'Coach Growth',
    priceCents: 4999,
    priceCentsSeats: 500,
    interval: 'Month',
    description:
      'Built for coaches scaling their practice with more clients and light team support.',
    featureList: ['People Management', 'Subscription Management'],
    userKey: 'pro',
    features: ['org:createCustomPromoCode', 'org:createPromoCode'],
    type: 'coach',
    hasMeteredSeats: true,
    maxAdminSeats: 50,
    maxSeats: 75,
  },
  {
    key: 'coach-agency',
    level: 3,
    name: 'Coach Agency',
    priceCents: 19999,
    priceCentsSeats: 350,
    interval: 'Month',
    description:
      'A full client-management platform for high-volume teams and agencies.',
    featureList: ['People Management', 'Subscription Management'],
    features: ['org:createCustomPromoCode', 'org:createPromoCode'],
    userKey: 'pro',
    type: 'coach',
    hasMeteredSeats: true,
    maxAdminSeats: 100,
    maxSeats: 250,
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
        priceCentsSeats: plan.priceCentsSeats,
        description: plan.description,
        featureList: plan.featureList,
        userKey: plan.userKey,
        hasMeteredSeats: plan.hasMeteredSeats,
        type: plan.type,
        maxAdminSeats: plan.maxAdminSeats,
        maxSeats: plan.maxSeats,
        features: plan.features || [],
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
