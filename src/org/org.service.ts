import { Plan } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto, UpdateOrgSubscriptionDto } from './dto/update-org.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { roundUpToNext100 } from 'src/utils/roundUp100';
import { getDomainFromEmail } from 'src/utils/getDomain';
import { CacheService } from 'src/cache/cache.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private cache: CacheService,
    private mailService: MailService,
  ) {}

  async create(createOrgDto: CreateOrgDto) {
    const planKey =
      createOrgDto.planKey || process.env.DEFAULT_SUBSCRIPTION_KEY;
    const plan = await this.cache.wrap(
      `plan:${planKey}`,
      () => {
        return this.prisma.plan.findFirst({
          where: {
            key: planKey,
          },
        });
      },
      86400,
    );

    if (!plan) {
      console.log('missingPlan', planKey);
    }

    const newOrg = await this.prisma.organization.create({
      data: {
        name: createOrgDto.orgName,
        seatCount: roundUpToNext100(createOrgDto.orgSize) || 0,
        email: createOrgDto.orgEmail.toLowerCase(),
        logoURL: createOrgDto.orgLogo,
        defaultPlanID: plan?.id,
        orgAdmins: {
          connect: { id: createOrgDto.admin },
        },
      },
    });
    if (createOrgDto.orgDomain) {
      await this.prisma.domain.create({
        data: {
          orgID: newOrg.id,
          domain: createOrgDto.orgDomain,
        },
      });
    }

    const address =
      createOrgDto.country && createOrgDto.postalCode
        ? {
            country: createOrgDto.country,
            postal_code: createOrgDto.postalCode,
          }
        : undefined;

    const stripeCustomer = await this.stripeService.createStripeCustomer(
      undefined,
      newOrg,
      address,
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
    if (!domain) {
      return { hasOpenSeats: false, org: undefined, plan: undefined };
    }
    const org = await this.prisma.organization.findFirst({
      where: { domains: { some: { domain } } },
    });

    if (!org) {
      return { hasOpenSeats: false, org: undefined, plan: undefined };
    }

    // TODO Check if org if active

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
                status: 'org-managed',
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

  async getOrgAdmins(id: string) {
    const admins = await this.cache.wrap(
      `orgAdmins:${id}`,
      () =>
        this.prisma.user.findMany({
          where: {
            orgs: {
              some: { id },
            },
          },
        }),
      600,
    );

    return admins;
  }

  async addOrgAdmin(
    orgID: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
      select: { name: true },
    });
    console.log({ user });
    if (user !== null) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { orgs: { connect: { id: orgID } } },
      });
      await this.mailService.sendAdminAddedEmail({
        to: email,
        context: {
          firstName: user.firstName,
          orgName: org?.name || 'Organization',
        },
      });
      return user;
    }
    const newUser = await this.prisma.user.create({
      data: {
        password: '123abc',
        firstName,
        lastName,
        email: email.toLowerCase(),
        orgs: {
          connect: { id: orgID },
        },
      },
    });
    await this.mailService.sendAdminAddedEmail({
      to: email,
      context: {
        firstName: newUser.firstName,
        orgName: org?.name || 'Organization',
      },
    });
    return newUser;
  }

  removeUserFromOrg(orgID: string, userID: number) {
    // Remove Cache
    return this.prisma.subscription.updateMany({
      where: {
        userID,
        managedByID: orgID,
      },
      data: {
        status: 'org-admin-canceled',
      },
    });
  }

  async removeAdminFromOrg(orgID: string, userID: number) {
    await this.cache.del(`currentUser:${userID}`);
    await this.cache.del(`orgAdmins:${orgID}`);
    return this.prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        orgs: { disconnect: { id: orgID } },
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            orgSubscription: true,
            orgAdmins: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, includeSubscription?: string) {
    return this.prisma.organization.findFirst({
      where: { id },
      include: {
        domains: true,
        orgSubscription: includeSubscription === 'true' || false,
      },
    });
  }

  update(id: string, updateOrgDto: UpdateOrgDto) {
    return this.prisma.organization.update({
      where: { id },
      data: updateOrgDto,
    });
  }

  async updateSubscription(id: string, updateOrgDto: UpdateOrgSubscriptionDto) {
    const planKey = updateOrgDto.subscriptionType;
    const plan = await this.cache.wrap(
      `plan:${planKey}`,
      () => {
        return this.prisma.plan.findFirst({
          where: {
            key: planKey,
          },
        });
      },
      86400,
    );

    if (!plan) {
      console.log('missingPlan', planKey);
      throw Error(`Missing Plan: ${planKey}`);
    }

    await this.prisma.subscription.create({
      data: {
        orgID: id,
        status: 'active',
        planID: plan.id,
      },
    });

    return this.prisma.organization.update({
      where: { id },
      data: {
        seatCount: updateOrgDto.userCount,
      },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} org`;
  }
}
