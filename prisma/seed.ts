import { PrismaClient } from '@prisma/client';
import { FeatureFlags } from '../src/utils/featureFlags';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

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

  // Prep Question One
  await prisma.prepQuestion.upsert({
    where: { key: 'about-company' },
    update: {},
    create: {
      order: 1,
      key: 'about-company',
      question: 'What do you know about the company?',
      displayOn: ['Interview'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'like-company' },
    update: {},
    create: {
      order: 2,
      key: 'like-company',
      question: 'What do you like about the company?',
      displayOn: ['Interview'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'good-fit' },
    update: {},
    create: {
      order: 3,
      key: 'good-fit',
      question: 'What makes you a good fit for this role?',
      displayOn: ['Interview'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'role-grow' },
    update: {},
    create: {
      order: 4,
      key: 'role-grow',
      question: 'Describe how you can grow in this role.',
      displayOn: ['Interview'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'bring-up' },
    update: {},
    create: {
      order: 5,
      key: 'bring-up',
      question: 'What is a question you would like to bring up?s',
      displayOn: ['Interview'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'int-goal' },
    update: {},
    create: {
      order: 1,
      key: 'int-goal',
      question: 'What is your goal for this meeting?',
      displayOn: ['Internal'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'int-key-points' },
    update: {},
    create: {
      order: 2,
      key: 'int-key-points',
      question: 'What key points do you want to bring up during this meeting?',
      displayOn: ['Internal'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'int-outcomes' },
    update: {},
    create: {
      order: 3,
      key: 'int-outcomes',
      question: 'What are the best and worst outcomes for this meeting?',
      displayOn: ['Internal'],
    },
  });

  await prisma.prepQuestion.upsert({
    where: { key: 'int-action' },
    update: {},
    create: {
      order: 4,
      key: 'int-action',
      question: 'Describe potential actions to come out of this meeting?',
      displayOn: ['Internal'],
    },
  });

  const saltRounds = 10;
  const password = await bcrypt.hash('password', saltRounds);

  await prisma.user.upsert({
    where: { email: 'bob.buttonman@email.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Buttonman',
      email: 'bob.buttonman@email.com',
      accountStatus: 'active',
      password,
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
