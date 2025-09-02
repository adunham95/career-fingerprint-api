import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import {
  CreateRegisterDto,
  CreateRegisterOrgDto,
} from './dto/create-register.dto';
import { AuthService } from 'src/auth/auth.service';
import { Request, Response } from 'express';
import { AuthCookieService } from 'src/authcookie/authcookie.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
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
  @UseGuards(JwtAuthGuard)
  verifyEmail(
    @Body() data: { token: string; showFreeTrial: boolean },
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log({ data });
    return this.registerService.verifyEmail({ ...data, user: req.user });
  }
}
