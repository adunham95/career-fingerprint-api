import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async sendMail() {
    await this.mailService.sendEmail({
      subject: 'Welcome to the realm of NestJS',
      to: 'adunham95@gmail.com',
      template: 'received-ecard',
      context: {
        firstName: 'Adrian',
        eCardNumber: 'ECARD-1234',
      },
    });
  }
}
