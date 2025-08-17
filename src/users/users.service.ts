import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';
import { generateInviteString } from 'src/utils/generateReadableCode';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private readonly mailService: MailService,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    data.password = await this.hashPassword(data.password);

    const freePlan = await this.prisma.plan.findFirst({
      where: { key: 'free' }, // or { name: 'Free' }
    });

    if (!freePlan) {
      throw new HttpException('Missing Plans', HttpStatus.FAILED_DEPENDENCY);
    }

    const user = await this.prisma.user.create({
      data,
    });

    await this.prisma.subscription.create({
      data: {
        userID: user.id,
        planID: freePlan.id,
        status: 'active',
      },
    });

    await this.stripeService.newStripeCustomer(user);

    await this.mailService.sendWelcomeEmail({
      to: user.email,
      context: { firstName: user.firstName },
    });

    return user;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    if (data?.password) {
      data.password = await this.hashPassword(data.password as string);
    }
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'deleted',
        email: `user+${this.generateRandomString(15)}@cf.com`,
      },
    });
  }

  async newInviteCode(id: number): Promise<string> {
    const inviteCode = await this.generateInviteCode();

    await this.prisma.user.update({
      where: { id },
      data: {
        inviteCode,
      },
    });

    return inviteCode;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private async generateInviteCode(): Promise<string> {
    const inviteCode = generateInviteString();

    const currentCodes = await this.prisma.user.count({
      where: { inviteCode },
    });

    if (currentCodes > 0) {
      await this.generateInviteCode();
    }

    return inviteCode;
  }

  generateRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
