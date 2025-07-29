import { Processor, Process } from '@nestjs/bull';
import { User } from '@prisma/client';
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
      user: Partial<User> & Pick<User, 'id' | 'email'>;
      address?: { county: string; postal_code: string };
    }>,
  ) {
    const { user, address } = job.data;

    console.log(`Creating Stripe User`);

    const stripeCustomer = await this.stripeService
      .createStripeCustomer(user, address)
      .catch((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        console.log({ e });
        throw Error('Could not create stipe user');
      });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerID: stripeCustomer.id,
      },
    });

    console.log(`✅ Stripe user created`);
  }
}
