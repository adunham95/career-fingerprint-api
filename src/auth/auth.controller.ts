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
  UnauthorizedException,
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
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { SamlAuthGuard } from './SamlAuthGuard.guard';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(CustomThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // max 3 login attempts per minute per IP
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

  @Get('sso')
  @UseGuards(SamlAuthGuard)
  samlLogin(@Req() req: Request) {
    const email = req.query.email as string | undefined;
    const relayState = email ? `email=${encodeURIComponent(email)}` : undefined;
    console.log('🚀 SAML login triggered', { email, relayState });
  }

  @Get('sso/:domain')
  @UseGuards(SamlAuthGuard)
  samlLoginDomain(@Req() req: Request) {
    req.query.email = `test@${req.params.domain}`;
  }

  @Post('sso/callback')
  @UseGuards(SamlAuthGuard)
  async ssoCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // req.user comes from done(null, user)
    const { user } = req;

    if (!user) {
      throw Error('missing user');
    }

    // Reuse your existing helper
    const { accessToken } = await this.authService.loginUserByID(user.id);
    this.authCookieService.setAuthCookie(res, accessToken);

    return res.redirect(
      `${process.env.APP_URL}/dashboard?token=${accessToken}`,
    );
  }

  @Get('set-cookie')
  setCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing token');

    const token = authHeader.replace('Bearer ', '');
    this.authCookieService.setAuthCookie(res, token);
    return { ok: true };
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
