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
  }

  sendPreviewEmail() {
    return (
      this.mailerService
        .sendMail({
          to: 'no-reply@career-fingerprint.com',
          template: 'account-upgraded',
          subject: 'Preview Email',
          context: {
            resetPasswordLink: `example.com`,
            firstName: 'Adrian',
          },
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        .catch((e) => console.log({ e }))
    );
  }

  async sendWeeklyReminderEmail(params: {
    to: string;
    context: { firstName: string; streakCount?: number };
  }) {
    await this.mailQueue.add('weeklyEmail', {
      to: params.to,
      context: {
        ...params.context,
        weeklyLink: `${process.env.FRONT_END_URL}/dashboard/weekly`,
      },
    });
  }

  async sendWelcomeEmail(params: {
    to: string;
    context: { firstName: string; token: string };
  }) {
    await this.mailQueue.add('welcomeEmail', params);
  }

  async sendVerifyEmail(params: {
    to: string;
    context: { firstName: string; token: string };
  }) {
    await this.mailQueue.add('verifyEmail', params);
  }

  async sendTrialAlmostOver(params: {
    to: string;
    context: { firstName: string };
  }) {
    await this.mailQueue.add('trialAlmostOver', params);
  }

  async sendPremiumIntoEmail(params: {
    to: string;
    context: { firstName: string };
  }) {
    await this.mailQueue.add('premiumWelcome', params);
  }

  async sendAdminAddedEmail(params: {
    to: string;
    context: { firstName: string; orgName: string };
  }) {
    console.log('send admin added email');
    await this.mailQueue.add('adminAdded', {
      to: params.to,
      context: {
        ...params.context,
      },
    });
  }
}
