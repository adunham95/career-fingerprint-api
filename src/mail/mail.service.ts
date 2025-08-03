import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectQueue('email') private mailQueue: Queue,
    private readonly mailerService: MailerService,
  ) {}

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

  async sendResetEmail(params: {
    to: string;
    context: { email: string; token: string };
  }) {
    await this.mailQueue.add('resetPassword', {
      to: params.to,
      context: params.context,
    });
    // .sendMail({
    //   to: 'no-reply@career-fingerprint.com',
    //   template: 'password-reset',
    //   subject: 'Preview Email',
    //   context: {
    //     resetPasswordLink: `${process.env.APP_URL}/reset-password?email=${email}&token=${token}`,
    //   },
    // })

    // .catch((e) => console.log({ e }));
  }

  sendPreviewEmail() {
    return (
      this.mailerService
        .sendMail({
          to: 'no-reply@career-fingerprint.com',
          template: 'password-reset',
          subject: 'Preview Email',
          context: {
            resetPasswordLink: `example.com`,
          },
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        .catch((e) => console.log({ e }))
    );
  }

  async sendWeeklyReminderEmail(params: {
    to: string;
    context: { firstName: string };
  }) {
    await this.mailerService
      .sendMail({
        to: params.to,
        template: 'weekly-reminder',
        subject: 'Weekly Reminder Email',
        context: {
          ...params.context,
          weeklyLink: `${process.env.APP_URL}/dashboard/weekly`,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      .catch((e) => console.log({ e }));
  }
}
