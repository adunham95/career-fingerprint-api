import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';
import { roundUpToNext100 } from 'src/utils/roundUp100';

@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private readonly mailService: MailService,
  ) {}

  async create(createOrgDto: CreateOrgDto) {
    const newOrg = await this.prisma.organization.create({
      data: {
        name: createOrgDto.orgName,
        seatCount: roundUpToNext100(createOrgDto.orgSize) || 0,
        email: createOrgDto.orgEmail,
        domain: createOrgDto.orgDomain,
        domainVerified: false,
        admins: {
          connect: { id: createOrgDto.admin },
        },
      },
    });

    //TODO create stripe customer
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
