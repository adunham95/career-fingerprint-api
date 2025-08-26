import { Plan } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';
import { roundUpToNext100 } from 'src/utils/roundUp100';
import { getDomainFromEmail } from 'src/utils/getDomain';

@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private readonly mailService: MailService,
  ) {}

  async create(createOrgDto: CreateOrgDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { key: process.env.DEFAULT_SUBSCRIPTION_KEY },
      select: { id: true },
    });

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
      plan = await this.prisma.plan.findFirst({
        // TODO Figure out why this is breaking
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { id: org.defaultPlanID },
      });
    }

    if ((org?.seatCount || 0) > currentUsers) {
      return { hasOpenSeats: true, org, plan };
    }
    return { hasOpenSeats: false, org: undefined, plan: undefined };
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
