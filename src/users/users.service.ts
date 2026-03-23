import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';
import { generateInviteString } from 'src/utils/generateReadableCode';
import { CacheService } from 'src/cache/cache.service';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';

export const roundsOfHashing = 10;
const FREE_TIER_DEPRECATED_AT =
  process.env.FREE_TIER_GRANDFATHER_BEFORE || new Date('2024-01-02T00:00:00Z');

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private readonly mailService: MailService,
    private cache: CacheService,
    private auditService: AuditService,
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

  async getCurrentUser(id: number) {
    const currentUserBase = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orgAdminLinks: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                logoURL: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const myOrgs = await this.prisma.orgUser.findMany({
      where: { userId: id },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            logoURL: true,
            type: true,
          },
        },
      },
    });

    return { ...currentUserBase, myOrgs };
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

  // @deprecated use better-auth version
  async createUser(
    data: Prisma.UserCreateInput,
    doNotSendWelcomeEmail?: boolean,
    doNotHashPassword?: boolean,
    ipAddress?: string,
  ): Promise<User> {
    if (!doNotHashPassword) {
      this.validatePassword(data.password);
      data.password = await this.hashPassword(data.password);
    }

    data.email = data.email.toLowerCase();

    let user: User;
    try {
      user = await this.prisma.user.create({ data });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    // await this.auditService.logEvent(
    //   AUDIT_EVENT.USER_CREATED,
    //   user.id,
    //   ipAddress,
    // );

    if (user.createdAt < FREE_TIER_DEPRECATED_AT) {
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

      await this.prisma.subscription.create({
        data: {
          userID: user.id,
          planID: freePlan.id,
          status: 'active',
        },
      });
    } else {
      // 🚫 No free subscription for new users
      // They will be required to start a paid plan before accessing app features.
    }

    // await this.stripeService.newStripeCustomer({ user });

    // await this.mailService.addContactToMailTrap(user);

    if (!doNotSendWelcomeEmail) {
      await this.mailService.sendWelcomeEmail({
        to: user.email,
        context: {
          firstName: user.firstName,
          token: await this.createEmailValidationCode(user.id, true),
        },
      });
    }

    return user;
  }

  async upsertUser(
    data: Prisma.UserCreateInput,
    doNotSendWelcomeEmail?: boolean,
    doNotHashPassword?: boolean,
    ipAddress?: string,
  ) {
    data.email = data.email.toLowerCase();
    const currentUser = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (currentUser) {
      return currentUser;
    }

    data.password = doNotHashPassword
      ? data.password
      : await this.hashPassword(data.password);

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

    await this.auditService.logEvent(
      AUDIT_EVENT.USER_CREATED,
      user.id,
      ipAddress,
    );

    if (user.createdAt < FREE_TIER_DEPRECATED_AT) {
      await this.prisma.subscription.create({
        data: {
          userID: user.id,
          planID: freePlan.id,
          status: 'active',
        },
      });
    } else {
      // 🚫 No free subscription for new users
      // They will be required to start a paid plan before accessing app features.
    }

    await this.stripeService.newStripeCustomer({ user });

    if (!doNotSendWelcomeEmail) {
      await this.mailService.sendWelcomeEmail({
        to: user.email,
        context: {
          firstName: user.firstName,
          token: await this.createEmailValidationCode(user.id, true),
        },
      });
    }

    return user;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;

    await this.cache.del(`currentUser:${where.id}`);

    if (data?.password) {
      this.validatePassword(data.password as string);
      data.password = await this.hashPassword(data.password as string);
    }
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(id: number): Promise<User> {
    await this.cache.del(`currentUser:${id}`);
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

  async getStripeStatus(userID: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userID },
    });

    if (!user) {
      throw Error('User Not Found');
    }

    if (user?.stripeCustomerID) {
      return { stripeID: user.stripeCustomerID };
    }

    const stripeCustomer = await this.stripeService.createStripeCustomer(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerID: stripeCustomer.id,
      },
    });

    return { stripeID: stripeCustomer.id };
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

  private validatePassword(password: string): void {
    const errors: string[] = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
    if (!/\d/.test(password)) errors.push('a number');
    if (!/[^a-zA-Z0-9\s]/.test(password)) errors.push('a special character');

    if (errors.length > 0) {
      throw new BadRequestException(
        `Password must contain ${errors.join(', ')}`,
      );
    }
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

  async getMyStats(userId: number): Promise<{
    totalAchievements: number;
    totalAchievementsBracket: string | number;
    achievementsThisWeek: number;
    activeGoals: number;
  }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [totalAchievements, achievementsThisWeek, activeGoals] =
      await this.cache.wrap(
        `userStats:${userId}`,
        () =>
          Promise.all([
            this.prisma.achievement.count({ where: { userID: userId } }),
            this.prisma.achievement.count({
              where: { userID: userId, createdAt: { gte: weekStart } },
            }),
            this.prisma.goal.count({
              where: { userID: userId, status: 'active' },
            }),
          ]),
        300,
      );

    return {
      totalAchievements,
      totalAchievementsBracket: this.achievementBracket(totalAchievements),
      achievementsThisWeek,
      activeGoals,
    };
  }

  private achievementBracket(count: number): string | number {
    if (count <= 10) return count;
    const thresholds = [20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500];
    const bracket = [...thresholds].reverse().find((t) => count >= t);
    return bracket ? `${bracket}+` : count;
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
