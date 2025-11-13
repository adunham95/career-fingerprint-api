import { Injectable } from '@nestjs/common';
import { CreateThankYousDto } from './dto/create-thank-yous.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ThankYousService {
  constructor(
    private readonly prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(createThankYousDto: CreateThankYousDto) {
    return this.prisma.$transaction(async (tx) => {
      const thankYou = await tx.thankYou.create({
        data: { message: createThankYousDto.message },
      });

      let createdContacts: { id: string }[] = [];
      if (createThankYousDto.contacts?.length) {
        createdContacts = await tx.contact.createManyAndReturn({
          data: createThankYousDto.contacts,
        });
      }

      if (createdContacts.length) {
        await tx.thankYou.update({
          where: { id: thankYou.id },
          data: {
            contacts: {
              connect: createdContacts.map((c) => ({ id: c.id })),
            },
          },
        });
      }

      return thankYou;
    });
  }
}
