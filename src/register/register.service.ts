import { Injectable } from '@nestjs/common';
import {
  CreateRegisterDto,
  CreateRegisterOrgDto,
} from './dto/create-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Plan, User } from '@prisma/client';
import { OrgService } from 'src/org/org.service';
import { CacheService } from 'src/cache/cache.service';
import bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private org: OrgService,
    private cache: CacheService,
  ) {}
  async registerNewUser(createRegisterDto: CreateRegisterDto) {
    const newUser = await this.users.createUser({
      email: createRegisterDto.email,
      password: createRegisterDto.password,
      firstName: createRegisterDto.firstName,
      lookingFor: createRegisterDto.lookingFor,
    });

    if (createRegisterDto.inviteCode) {
      const codeUser = await this.prisma.user.findFirst({
        where: { inviteCode: createRegisterDto.inviteCode },
      });

      if (codeUser) {
        await this.prisma.inviteRedemption.create({
          data: {
            inviteCode: createRegisterDto.inviteCode,
            inviteeUserId: codeUser?.id,
            inviterUserId: newUser.id,
          },
        });
      }
    }

    console.log({ newUser });

    let plan: Plan | null = null;

    switch (createRegisterDto.lookingFor) {
      case 'student':
        await this.prisma.education.create({
          data: {
            institution: createRegisterDto.institution,
            degree: createRegisterDto.degree,
            userID: newUser.id,
            startDate: createRegisterDto.startDate,
            currentPosition: true,
            achievements: {
              create: {
                userID: newUser.id,
                myContribution: createRegisterDto.achievement,
              },
            },
          },
        });

        plan = await this.cache.wrap(
          `plan:${process.env.DEFAULT_SUBSCRIPTION_KEY}`,
          () => {
            return this.prisma.plan.findFirst({
              where: { key: process.env.DEFAULT_SUBSCRIPTION_KEY },
            });
          },
          86400,
        );
        break;

      case 'growing':
      case 'job':
        await this.prisma.jobPosition.create({
          data: {
            userID: newUser.id,
            name: createRegisterDto.title,
            company: createRegisterDto.companyName,
            startDate: createRegisterDto.startDate,
            endDate:
              createRegisterDto.endDate === ''
                ? null
                : createRegisterDto.endDate,
            currentPosition: true,
            achievements: {
              create: {
                userID: newUser.id,
                myContribution: createRegisterDto.achievement,
              },
            },
          },
        });

        plan = await this.cache.wrap(
          `plan:${process.env.DEFAULT_SUBSCRIPTION_KEY}`,
          () => {
            return this.prisma.plan.findFirst({
              where: { key: process.env.DEFAULT_SUBSCRIPTION_KEY },
            });
          },
          86400,
        );
        break;
      default:
        break;
    }

    return {
      user: newUser,
      plan: plan,
    };
  }

  async registerNewOrg(createRegisterOrgDto: CreateRegisterOrgDto) {
    const newUser = await this.users.createUser({
      email: createRegisterOrgDto.email,
      password: createRegisterOrgDto.password,
      firstName: createRegisterOrgDto.firstName,
      lastName: createRegisterOrgDto.lastName,
    });

    const newOrg = await this.org.create({
      orgDomain: createRegisterOrgDto.orgDomain,
      orgEmail: createRegisterOrgDto.orgEmail,
      orgName: createRegisterOrgDto.orgName,
      orgSize: createRegisterOrgDto.orgSize,
      admin: newUser.id,
    });
    return { user: newUser, org: newOrg };
  }

  async verifyEmail(data: {
    token: string;
    showFreeTrial: boolean;
    user: User;
  }) {
    const verifyToken = await this.prisma.verifyToken.findFirst({
      where: { userID: data.user.id, expiresAt: { gt: new Date() } },
    });

    if (!verifyToken) throw Error('Missing Verification Token');

    const isTokenValid = await bcrypt.compare(data.token, verifyToken?.token);

    if (!isTokenValid) {
      throw Error('Verification Code Failed');
    }

    await this.prisma.verifyToken.deleteMany({
      where: { userID: verifyToken.userID },
    });

    await this.prisma.user.update({
      where: { id: data.user.id },
      data: { emailVerified: true },
    });

    await this.cache.del(`activeUserSubscription:${data.user.id}`);

    if (!data.showFreeTrial) {
      return { verified: true };
    }

    const plan = await this.cache.wrap(
      `plan:${process.env.DEFAULT_SUBSCRIPTION_KEY}`,
      () => {
        return this.prisma.plan.findFirst({
          where: { key: process.env.DEFAULT_SUBSCRIPTION_KEY },
        });
      },
      86400,
    );

    const { org, plan: orgPlan } = await this.org.hasSpace(data.user.email);

    return {
      plan: orgPlan || plan,
      orgID: org?.id,
      orgName: org?.name,
      verified: true,
    };
  }
}
