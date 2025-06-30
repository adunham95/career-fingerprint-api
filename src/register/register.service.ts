import { Injectable } from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Plan } from '@prisma/client';
@Injectable()
export class RegisterService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
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
                description: createRegisterDto.achievement,
              },
            },
          },
        });

        plan = await this.prisma.plan.findFirst({ where: { key: 'pro' } });
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
                description: createRegisterDto.achievement,
              },
            },
          },
        });

        plan = await this.prisma.plan.findFirst({ where: { key: 'pro' } });
        break;
      default:
        break;
    }

    return { user: newUser, plan };
  }
}
