import { Processor, Process } from '@nestjs/bull';
import { Organization, User } from '@prisma/client';
import { Job } from 'bull';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('stripe')
export class StripeProcessor {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('linkToStripe')
  async addStripeUser(
    job: Job<{
      user?: Partial<User> & Pick<User, 'id' | 'email'>;
      org?: Partial<Organization> & Pick<Organization, 'id' | 'email'>;
      address?: { country: string; postal_code: string };
    }>,
  ) {
    const { user, org, address } = job.data;

    const stripeCustomer = await this.stripeService
      .createStripeCustomer(user, org, address)
      .catch((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        console.log({ e });
        throw Error('Could not create stipe user');
      });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerID: stripeCustomer.id,
        },
      });
      console.log(`✅ Stripe user created`);
    }
    if (org) {
      await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          stripeCustomerID: stripeCustomer.id,
        },
      });
      console.log(`✅ Stripe org created`);
    }
  }
}
