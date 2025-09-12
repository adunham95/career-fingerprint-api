import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';
import { generateInviteString } from 'src/utils/generateReadableCode';
import { CacheService } from 'src/cache/cache.service';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private readonly mailService: MailService,
    private cache: CacheService,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    userIncludeInput?: Prisma.UserInclude,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: userIncludeInput,
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

    const freePlan = await this.cache.wrap(
      'plan:free',
      () => {
        return this.prisma.plan.findFirst({
          where: { key: 'free' },
        });
      },
      86400,
    );

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

    await this.stripeService.newStripeCustomer({ user });

    await this.mailService.sendWelcomeEmail({
      to: user.email,
      context: {
        firstName: user.firstName,
        token: await this.createEmailValidationCode(user.id, true),
      },
    });

    return user;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    await this.cache.del(`currentUser:${where.id}`);

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
    const currentUserCode = await this.prisma.user.findFirst({
      where: { id },
      select: { inviteCode: true },
    });

    if (currentUserCode?.inviteCode) {
      return currentUserCode.inviteCode;
    }

    const inviteCode = await this.generateInviteCode();

    await this.prisma.user.update({
      where: { id },
      data: {
        inviteCode,
      },
    });

    return inviteCode;
  }

  async inviteCodeStats(id: number): Promise<{ totalInvited: number }> {
    const invited = await this.cache.wrap(`invitedUserStats:${id}`, () => {
      return this.prisma.inviteRedemption.count({
        where: { inviterUserId: id, rewardStatus: 'credited' },
      });
    });

    return {
      totalInvited: invited,
    };
  }

  async startEmailVerification(user: User) {
    await this.mailService.sendVerifyEmail({
      to: user.email,
      context: {
        firstName: user.firstName,
        token: await this.createEmailValidationCode(user.id),
      },
    });

    return { success: true };
  }

  private async createEmailValidationCode(userID: number, extended?: boolean) {
    const now = new Date();

    const expirationDate = extended
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 10 * 60 * 1000);

    const token = this.generateRandomString(10);

    await this.prisma.verifyToken.create({
      data: {
        token,
        userID,
        expiresAt: expirationDate.toISOString(),
      },
    });

    return token;
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
