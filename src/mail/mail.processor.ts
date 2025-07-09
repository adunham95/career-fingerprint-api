import { MailerService } from '@nestjs-modules/mailer';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('sendEmail')
  async handleSendEmail(
    job: Job<{ to: string; subject: string; body: string; template: string }>,
  ) {
    const { to, subject, template } = job.data;

    console.log(`📧 Sending email to ${to}`);

    await this.mailerService
      .sendMail({
        to,
        template,
        subject,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      .catch((e) => console.log({ e }));
    console.log(`✅ Email sent to ${to}`);
  }

  @Process('sendECardNotification')
  async handleSendECardNotification(
    job: Job<{
      to: string;
      context: { eCardNumber: string; firstName: string };
    }>,
  ) {
    const {
      to,
      context: { eCardNumber, firstName },
    } = job.data;

    const template = 'ecard-notification';
    const subject = 'You have received a new ECard From Planner Bee';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          ecardURL: `https://planner-bee.com/ecard/${eCardNumber}`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❎ Email not sent`, error);
    }
  }
}
