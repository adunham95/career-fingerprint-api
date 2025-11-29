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

  @Process('resetPassword')
  async handleSendPasswordReset(
    job: Job<{
      to: string;
      context: { email: string; token: string };
    }>,
  ) {
    const {
      to,
      context: { email, token },
    } = job.data;

    const template = 'password-reset';
    const subject = 'Reset Your Career Fingerprint Password';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          resetPasswordLink: `${process.env.FRONT_END_URL}/reset-password?email=${email}&token=${token}`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('weeklyEmail')
  async weeklyEmail(
    job: Job<{
      to: string;
      context: { firstName: string; weeklyLink: string };
    }>,
  ) {
    const {
      to,
      context: { firstName, weeklyLink },
    } = job.data;

    const template = 'weekly-reminder';
    const subject = 'Weekly Reminder Email';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          weeklyLink,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('welcomeEmail')
  async welcomeEmail(
    job: Job<{
      to: string;
      context: { firstName: string; token: string };
    }>,
  ) {
    const {
      to,
      context: { firstName, token },
    } = job.data;

    const template = 'welcome';
    const subject = 'Start Your Free Premium Trial';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          verifyLink: `${process.env.FRONT_END_URL}/verify?token=${token}&showFreeTrial=true`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('welcomeOrgUserEmail')
  async welcomeOrgEmail(
    job: Job<{
      to: string;
      context: { firstName: string; orgName: string };
    }>,
  ) {
    const { to, context } = job.data;

    const template = 'welcome-org-user';
    const subject = 'A Career Fingerprint Account has been created for you!';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          ...context,
          resetPasswordLink: `${process.env.FRONT_END_URL}/forgot-password`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('orgUserUpgradedEmail')
  async orgUpgradedEmail(
    job: Job<{
      to: string;
      context: { firstName: string; orgName: string };
    }>,
  ) {
    const { to, context } = job.data;

    const template = 'org-user-upgraded';
    const subject = 'You have been added to an Career Fingerprint Org';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          ...context,
          loginLink: `${process.env.FRONT_END_URL}/login`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('verifyEmail')
  async verifyEmail(
    job: Job<{
      to: string;
      context: { firstName: string; token: string };
    }>,
  ) {
    const {
      to,
      context: { firstName, token },
    } = job.data;

    const template = 'verify-email';
    const subject = 'Verify your email';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          verifyLink: `${process.env.FRONT_END_URL}/verify?token=${token}`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('trialAlmostOver')
  async trialAlmostOver(
    job: Job<{
      to: string;
      context: { firstName: string; daysLeft: number };
    }>,
  ) {
    const {
      to,
      context: { firstName, daysLeft },
    } = job.data;

    const template = 'trial-almost-over';
    const subject = 'Your Career Fingerprint Trial is almost over';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          daysLeft,
          updateCCLink: `${process.env.FRONT_END_URL}/settings/membership`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('premiumWelcome')
  async premiumWelcome(
    job: Job<{
      to: string;
      context: { firstName: string };
    }>,
  ) {
    const {
      to,
      context: { firstName },
    } = job.data;

    const template = 'account-upgraded';
    const subject =
      'Congratulations Your Career Fingerprint, has been upgraded ';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          firstName,
          myAccountLink: `${process.env.FRONT_END_URL}/dashboard`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('adminAdded')
  async adminAdded(
    job: Job<{
      to: string;
      context: { firstName: string; orgName: string };
    }>,
  ) {
    const { to, context } = job.data;

    const template = 'admin-added';
    const subject = 'You have been added to a Career Fingerprint Organization ';

    console.log(`📧 Sending email to ${to}`);

    try {
      await this.mailerService.sendMail({
        to: [to],
        template,
        subject,
        context: {
          ...context,
          loginLink: `${process.env.FRONT_END_URL}/login`,
        },
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('thankYouNotes')
  async thankYouNote(
    job: Job<{
      userEmail: string;
      to: string[];
      context: { message: string; senderName: string };
    }>,
  ) {
    const { to, context, userEmail } = job.data;

    const template = 'thank-you';
    const subject = 'Thank You';

    console.log(`📧 Sending email to ${to.join(',')}`);

    console.log('data', job.data);

    try {
      await this.mailerService.sendMail({
        from: `"${context.senderName} (via Career Fingerprint)" <${process.env.SMTP_FROM_EMAIL}>`,
        sender: process.env.SMTP_FROM_EMAIL,
        replyTo: userEmail,
        to,
        template,
        subject,
        context,
      });
      console.log(`✅ Email sent to ${to.join(',')}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }

  @Process('goalComplete')
  async goalComplete(
    job: Job<{
      to: string[];
      context: {
        goalName: string;
        firstName: string;
        recentAchievements: string[] | null;
      };
    }>,
  ) {
    const { to, context } = job.data;

    const template = 'goal-complete';
    const subject = 'You Completed Your Goal!';

    console.log(`📧 Sending email to ${to.join(',')}`);

    console.log('data', job.data);

    try {
      await this.mailerService.sendMail({
        sender: process.env.SMTP_FROM_EMAIL,
        to,
        template,
        subject,
        context,
      });
      console.log(`✅ Email sent to ${to.join(',')}`);
    } catch (error) {
      console.log(`❌ Email not sent`, error);
      throw error;
    }
  }
}
