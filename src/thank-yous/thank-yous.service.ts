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

  async create(userID: number, createThankYousDto: CreateThankYousDto) {
    return this.prisma.$transaction(async (tx) => {
      const thankYou = await tx.thankYou.create({
        data: { message: createThankYousDto.message },
      });

      if (createThankYousDto.contacts?.length) {
        for (
          let index = 0;
          index < createThankYousDto.contacts.length;
          index++
        ) {
          const details = createThankYousDto.contacts[index];
          let currentContact = await tx.contact.findFirst({
            where: { email: details.email },
          });
          if (!currentContact) {
            currentContact = await tx.contact.create({
              data: {
                email: details.email,
                firstName: details.firstName,
                userID,
              },
            });
          }
          await tx.contact.update({
            where: { id: currentContact.id },
            data: {
              thankYou: {
                connect: { id: thankYou.id },
              },
              meetings: {
                connect: { id: createThankYousDto.meetingID },
              },
            },
          });
        }
      }

      return thankYou;
    });
  }
}
