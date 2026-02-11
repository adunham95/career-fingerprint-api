import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { MailService } from 'src/mail/mail.service';
import { OrgUsersService } from 'src/org-users/org-users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { UsersService } from 'src/users/users.service';

type CsvUserRow = {
  'First Name'?: string;
  'Last Name'?: string;
  Email: string;
};

@Processor('register-users')
export class RegisterUsersProcessor {
  constructor(
    private prismaService: PrismaService,
    private userService: UsersService,
    private subscriptionService: SubscriptionsService,
    private mailService: MailService,
    private orgUserService: OrgUsersService,
  ) {}

  @Process('importUsers')
  async handleImportUsers(job: Job<{ filePath: string; orgID: string }>) {
    const { filePath, orgID } = job.data;
    const stream = fs.createReadStream(filePath);

    const parserOptions = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    } as const;

    // Explicitly type the parser to avoid ESLint errors
    const parser = parse(parserOptions);

    return new Promise((resolve, reject) => {
      let processed = 0;
      const errors: Array<{ record: CsvUserRow; reason: string }> = [];

      parser.on('readable', async () => {
        let record: CsvUserRow | null;
        while ((record = parser.read() as CsvUserRow | null)) {
          if (!record) continue;

          const org = await this.prismaService.organization.findFirst({
            where: { id: orgID },
          });

          if (!org) {
            throw Error('Missing connection org');
          }

          try {
            const user = await this.orgUserService.createOrgMember({
              firstName: record['First Name'] || '',
              lastName: record['Last Name'] || '',
              email: record.Email,
              orgID: orgID,
            });

            processed++;
            if (processed % 100 === 0) {
              await job.progress(processed);
            }
          } catch (err) {
            errors.push({ record, reason: (err as Error).message });
          }
        }
      });

      parser.on('end', () => {
        fs.unlinkSync(filePath); // clean up
        resolve({ processed, errors });
      });

      parser.on('error', (err) => reject(err));

      stream.pipe(parser);
    });
  }

  generateRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
