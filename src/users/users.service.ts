import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { StripeService } from 'src/stripe/stripe.service';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
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

    const stripeCustomer = await this.stripe.createStripeCustomer(user);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerID: stripeCustomer.id,
      },
    });

    await this.prisma.subscription.create({
      data: {
        userID: user.id,
        planID: freePlan.id,
        status: 'active',
      },
    });

    return updatedUser;
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

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
