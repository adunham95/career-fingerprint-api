import { Plan } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { roundUpToNext100 } from 'src/utils/roundUp100';
import { getDomainFromEmail } from 'src/utils/getDomain';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private cache: CacheService,
  ) {}

  async create(createOrgDto: CreateOrgDto) {
    const plan = await this.cache.wrap(
      `plan:${process.env.DEFAULT_SUBSCRIPTION_KEY}`,
      () => {
        return this.prisma.plan.findFirst({
          where: { key: process.env.DEFAULT_SUBSCRIPTION_KEY },
        });
      },
      86400,
    );

    if (!plan) {
      console.log('missingPlan', process.env.DEFAULT_SUBSCRIPTION_KEY);
    }

    const newOrg = await this.prisma.organization.create({
      data: {
        name: createOrgDto.orgName,
        seatCount: roundUpToNext100(createOrgDto.orgSize) || 0,
        email: createOrgDto.orgEmail,
        domain: createOrgDto.orgDomain,
        domainVerified: false,
        defaultPlanID: plan?.id,
        admins: {
          connect: { id: createOrgDto.admin },
        },
      },
    });

    const stripeCustomer = await this.stripeService.createStripeCustomer(
      undefined,
      newOrg,
    );

    const updatedOrg = await this.prisma.organization.update({
      where: { id: newOrg.id },
      data: {
        stripeCustomerID: stripeCustomer.id,
      },
    });
    //TODO Send Verification Email

    return updatedOrg;
  }

  async hasSpace(email: string) {
    const domain = getDomainFromEmail(email);
    const org = await this.prisma.organization.findFirst({
      where: { domain },
    });

    if (!org) {
      return { hasOpenSeats: false, org: undefined, plan: undefined };
    }

    const currentUsers = await this.prisma.subscription.count({
      where: { managedByID: org?.id },
    });

    let plan: Plan | undefined | null = undefined;

    if (typeof org.defaultPlanID === 'string') {
      plan = await this.cache.wrap(
        `plan:${org.defaultPlanID}`,
        () => {
          return this.prisma.plan.findFirst({
            // TODO Figure out why this is breaking

            where: { id: org.defaultPlanID || '' },
          });
        },
        86400,
      );
    }

    if ((org?.seatCount || 0) > currentUsers) {
      return { hasOpenSeats: true, org, plan };
    }
    return { hasOpenSeats: false, org: undefined, plan: undefined };
  }

  async getOrgUsers(id: string, pageSize = 20, page = 1) {
    const pageUsers = await this.cache.wrap(
      `orgUsers:${id}:page:${page}:size:${pageSize}`,
      () =>
        this.prisma.user.findMany({
          where: {
            subscriptions: {
              some: {
                managedByID: id,
              },
            },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc', // consistent ordering is important
          },
        }),
      600,
    );

    const totalCount = await this.cache.wrap(
      `totalOrgUsers:${id}`,
      () =>
        this.prisma.user.count({
          where: {
            subscriptions: {
              some: { managedByID: id },
            },
          },
        }),
      600,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return { totalCount, page, pageSize, users: pageUsers, totalPages };
  }

  findAll() {
    return `This action returns all org`;
  }

  findOne(id: string) {
    return `This action returns a #${id} org`;
  }

  update(id: string, updateOrgDto: UpdateOrgDto) {
    console.log({ org: updateOrgDto });
    return `This action updates a #${id} org`;
  }

  remove(id: string) {
    return `This action removes a #${id} org`;
  }
}
