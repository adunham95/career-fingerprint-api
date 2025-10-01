import { Injectable } from '@nestjs/common';
import {
  CreateRegisterDto,
  CreateRegisterOrgDto,
} from './dto/create-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { OrgService } from 'src/org/org.service';
import { CacheService } from 'src/cache/cache.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Injectable()
export class RegisterService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private org: OrgService,
    private subscription: SubscriptionsService,
    private cache: CacheService,
  ) {}
  async registerNewUser(createRegisterDto: CreateRegisterDto) {
    const newUser = await this.users.createUser({
      email: createRegisterDto.email,
      password: createRegisterDto.password,
      firstName: createRegisterDto.firstName,
      lastName: createRegisterDto.lastName,
      lookingFor: createRegisterDto.lookingFor,
      timezone: createRegisterDto.timezone,
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

    if (createRegisterDto.orgID) {
      await this.subscription.createOrgManagedSubscription({
        userID: newUser.id,
        orgID: createRegisterDto.orgID,
      });
    }

    console.log({ newUser });

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
                startDate: new Date().toISOString(),
                userID: newUser.id,
                myContribution: createRegisterDto.achievement,
              },
            },
          },
        });

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
                startDate: new Date().toISOString(),
                userID: newUser.id,
                myContribution: createRegisterDto.achievement,
              },
            },
          },
        });

        break;
      default:
        break;
    }

    return {
      user: newUser,
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
      orgLogo: createRegisterOrgDto.orgLogo,
      admin: newUser.id,
    });
    return { user: newUser, org: newOrg };
  }

  async verifyEmail(data: { token: string; showFreeTrial: boolean }) {
    const verifyToken = await this.prisma.verifyToken.findFirst({
      where: { token: data.token, expiresAt: { gt: new Date() } },
    });

    if (!verifyToken) throw Error('Missing Verification Token');

    await this.prisma.verifyToken.deleteMany({
      where: { userID: verifyToken.userID },
    });

    const user = await this.prisma.user.findFirst({
      where: { id: verifyToken.userID },
    });

    if (!user) {
      throw Error('Missing User');
    }

    await this.prisma.user.update({
      where: { id: verifyToken.userID },
      data: { emailVerified: true },
    });

    await this.cache.del(`activeUserSubscription:${verifyToken.userID}`);

    if (!data.showFreeTrial) {
      return { verified: true, userID: verifyToken.userID };
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

    const { org, plan: orgPlan } = await this.org.hasSpace(user.email);

    return {
      plan: orgPlan || plan,
      orgID: org?.id,
      orgName: org?.name,
      verified: true,
      userID: verifyToken.userID,
    };
  }
}
