import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

type CsvUserRow = {
  firstName?: string;
  lastName?: string;
  email: string;
};

@Processor('users-import')
export class UsersProcessor {
  constructor(private prismaService: PrismaService) {}

  @Process('importUsers')
  async handleImportUsers(job: Job<{ filePath: string }>) {
    const { filePath } = job.data;
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

          try {
            await this.prismaService.user.upsert({
              where: { email: record.email },
              update: {
                firstName: record.firstName || undefined,
                lastName: record.lastName || undefined,
              },
              create: {
                email: record.email,
                password: '123abc', //default, cant actually get in with that
                firstName: record.firstName || undefined,
                lastName: record.lastName || undefined,
              },
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
}
