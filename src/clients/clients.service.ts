import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { generateRandomString } from 'src/utils/generateRandomString';
import { MailService } from 'src/mail/mail.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private user: UsersService,
    private mail: MailService,
    private subscriptions: SubscriptionsService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const org = await this.prisma.organization.findFirst({
      where: { id: createClientDto.orgID },
    });

    if (!org) {
      throw Error('Missing connection org');
    }

    try {
      let user = await this.prisma.user.findFirst({
        where: { email: createClientDto.email },
      });
      if (!user) {
        console.log('adding user', createClientDto.email);
        user = await this.user.createUser(
          {
            email: createClientDto.email,
            password: generateRandomString(10),
            firstName: createClientDto.firstName,
            lastName: createClientDto.lastName,
            passwordRestRequired: true,
          },
          true,
        );

        await this.mail.sendWelcomeOrgEmail({
          to: createClientDto.email,
          context: {
            firstName: createClientDto.firstName || '',
            orgName: org.name,
          },
        });
      } else {
        await this.mail.sendOrgUpgradedEmail({
          to: createClientDto.email,
          context: {
            firstName: createClientDto.firstName || '',
            orgName: org.name,
          },
        });
      }

      console.log(user);

      const newOrgUser = await this.subscriptions.createOrgManagedSubscription({
        userID: user.id,
        orgID: createClientDto.orgID,
      });
      console.log(newOrgUser);
    } catch (err) {
      console.log(err);
    }
  }
}
