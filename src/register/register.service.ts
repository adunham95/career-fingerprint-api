import { Injectable } from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
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
        break;

      case 'growing':
      case 'job':
        await this.prisma.jobPosition.create({
          data: {
            userID: newUser.id,
            name: createRegisterDto.position,
            company: createRegisterDto.companyName,
            startDate: createRegisterDto.startDate,
            endDate: createRegisterDto.endDate,
            currentPosition: true,
            achievements: {
              create: {
                userID: newUser.id,
                description: createRegisterDto.achievement,
              },
            },
          },
        });
        break;
      default:
        break;
    }

    return newUser;
  }
}
