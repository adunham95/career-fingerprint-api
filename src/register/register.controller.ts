import {
  Controller,
  Post,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import {
  CreateRegisterDto,
  CreateRegisterOrgDto,
} from './dto/create-register.dto';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'express';
import { AuthCookieService } from 'src/authcookie/authcookie.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
    private readonly prisma: PrismaService,
    @InjectQueue('register-users') private registerUsersQueue,
  ) {}

  @Post()
  async create(
    @Body() createRegisterDto: CreateRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user } =
      await this.registerService.registerNewUser(createRegisterDto);

    const { accessToken } = await this.authService.loginUser(
      user.email,
      createRegisterDto.password,
    );

    this.authCookieService.setAuthCookie(response, accessToken);
    return { accessToken, user };
  }

  @Post('org')
  async createOrg(
    @Body() createRegisterOrgDto: CreateRegisterOrgDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, org } =
      await this.registerService.registerNewOrg(createRegisterOrgDto);

    const { accessToken } = await this.authService.loginUser(
      user.email,
      createRegisterOrgDto.password,
    );

    this.authCookieService.setAuthCookie(response, accessToken);
    return { accessToken, user, org };
  }

  @Post('verify')
  async verifyEmail(@Body() data: { token: string; showFreeTrial: boolean }) {
    const verified = await this.registerService.verifyEmail(data);

    const { accessToken } = await this.authService.loginUserByID(
      verified.userID,
    );

    return { ...verified, accessToken };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUsers(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { orgID: string },
  ) {
    if (!file) throw new Error('No file uploaded');
    if (!body.orgID) throw new Error('No OrgID Added');

    const fileContent = file.buffer.toString('utf-8').trim();
    const rows = fileContent.split(/\r?\n/);

    // ✅ Validate header
    const expectedHeaders = ['First Name', 'Last Name', 'Email'];
    const headerRow = rows[0].split(',').map((h) => h.trim());

    const isHeaderValid =
      headerRow.length === expectedHeaders.length &&
      expectedHeaders.every((expected, i) => headerRow[i] === expected);

    if (!isHeaderValid) {
      throw new BadRequestException(
        `Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}. This is case sensitive.`,
      );
    }

    // Find Current User Count
    const currentUsers = await this.prisma.subscription.count({
      where: { managedByID: body.orgID },
    });
    const org = await this.prisma.organization.findFirst({
      where: { id: body.orgID },
      select: { maxSeatCount: true },
    });

    const maxUsers = org?.maxSeatCount ?? 0; // fallback if not set
    const userCount = rows.length - 1; // assuming first row is header

    if (currentUsers + userCount > maxUsers) {
      const remaining = Math.max(0, maxUsers - currentUsers);
      throw new BadRequestException(
        `User upload exceeds your limit. You can only add ${remaining} more user${remaining === 1 ? '' : 's'}.`,
      );
    }

    // Save file to a temp folder
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, file?.originalname);
    fs.writeFileSync(filePath, file?.buffer);

    // Add a background job
    const job = await this.registerUsersQueue.add('importUsers', {
      filePath,
      orgID: body.orgID,
    });

    return { jobId: job.id, message: 'File accepted for processing' };
  }
}
