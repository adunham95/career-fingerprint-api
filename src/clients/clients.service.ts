import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClientDto, InviteClientDto } from './dto/create-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { generateRandomString } from 'src/utils/generateRandomString';
import { MailService } from 'src/mail/mail.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { randomInt } from 'crypto';

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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
      let emailType: 'addToOrg' | 'newUser' = 'addToOrg';
      if (!user) {
        emailType = 'newUser';
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
      }

      console.log(user);

      const newOrgUser = await this.subscriptions.createOrgManagedSubscription(
        {
          userID: user.id,
          orgID: createClientDto.orgID,
        },
        emailType,
      );
      console.log(newOrgUser);
      return newOrgUser;
    } catch (err) {
      console.log(err);
    }
  }

  async invite(inviteClientDto: InviteClientDto) {
    const org = await this.prisma.organization.findFirst({
      where: { id: inviteClientDto.orgID },
    });

    if (!org) {
      throw new BadRequestException({
        code: 'MISSING_ORG',
        message: 'Org Connection could not be made',
      });
    }

    try {
      let invite = await this.prisma.orgInviteCode.findFirst({
        where: {
          orgID: org.id,
          disabledAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!invite) {
        invite = await this.createOrgInviteCode({
          orgID: org.id,
          createdByID: inviteClientDto.userID,
        });
      }

      await this.mail.sendClientInvite({
        to: inviteClientDto.email,
        context: {
          firstName: inviteClientDto.firstName,
          orgName: org.name,
          inviteCode: invite.code,
        },
      });

      return { success: true };
    } catch (error) {
      console.log(error);
    }
  }

  private randomChar(): string {
    return INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)];
  }

  generateInviteCode(): string {
    const part1 = Array.from({ length: 6 }, () => this.randomChar()).join('');

    const part2 = Array.from({ length: 3 }, () => this.randomChar()).join('');

    return `${part1}-${part2}`;
  }

  private async createOrgInviteCode({
    orgID,
    role = 'client',
    createdByID,
  }: {
    orgID: string;
    role?: string;
    createdByID: number;
  }) {
    for (let i = 0; i < 5; i++) {
      try {
        return await this.prisma.orgInviteCode.create({
          data: {
            orgID,
            role,
            createdByID,
            code: this.generateInviteCode(),
          },
        });
      } catch (err: any) {
        if (err.code !== 'P2002') throw err;
      }
    }

    throw new Error('Failed to generate invite code');
  }
}
