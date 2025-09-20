import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  InitiatePasswordResetDto,
  LoginDto,
  PasswordResetDto,
} from './dto/auth.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthCookieService } from 'src/authcookie/authcookie.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user } = await this.authService.loginUser(
      email,
      password,
    );
    this.logger.verbose('login response', {
      accessToken,
      secure: process.env.NODE_ENV === 'production',
      cookieDomain: process.env.COOKIE_DOMAIN,
    });
    this.authCookieService.setAuthCookie(response, accessToken);
    return { accessToken, user };
  }

  @Post('request-reset')
  requestPasswordReset(@Body() { email }: InitiatePasswordResetDto) {
    return this.authService.generateResetToken(email);
  }

  @Post('reset-password')
  requestPassword(@Body() { email, password, token }: PasswordResetDto) {
    return this.authService.resetFromToken(email, password, token);
  }

  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserEntity })
  user(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return new UserEntity(req?.user);
  }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    this.authCookieService.clearAuthCookie(response);
    return { success: true };
  }
}
