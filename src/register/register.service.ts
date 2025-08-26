import { Injectable } from '@nestjs/common';
import {
  CreateRegisterDto,
  CreateRegisterOrgDto,
} from './dto/create-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Plan } from '@prisma/client';
import { OrgService } from 'src/org/org.service';
import { CacheService } from 'src/cache/cache.service';

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
            name: createRegisterDto.position,
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

    const { org, plan: orgPlan } = await this.org.hasSpace(newUser.email);

    return {
      user: newUser,
      plan: orgPlan || plan,
      orgName: org?.name,
      orgID: org?.id,
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
}
