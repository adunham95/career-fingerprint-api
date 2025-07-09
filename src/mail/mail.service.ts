import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('email') private mailQueue: Queue) {}

  async sendEmail(params: {
    subject: string;
    template: string;
    to: string;
    context: ISendMailOptions['context'];
  }) {
    await this.mailQueue.add('sendECardNotification', {
      to: params.to,
      template: params.template,
      subject: params.subject,
      context: params.context,
    });
  }

  async sendECardNotification(params: {
    to: string;
    context: { firstName?: string; eCardNumber: string };
  }) {
    await this.mailQueue.add('sendECardNotification', {
      to: params.to,
      context: params.context,
    });
  }
}
