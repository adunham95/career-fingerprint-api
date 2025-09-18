import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
  constructor(
    private readonly authService: AuthService,
    private authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user, sessionToken, refreshToken } =
      await this.authService.loginUser(email, password);
    this.authCookieService.setAuthCookie(response, accessToken);
    this.authCookieService.setSessionCookie(response, sessionToken);
    this.authCookieService.setRefreshCookie(response, refreshToken);
    return { user };
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

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('refreshing');
    console.log(req.cookies.refreshToken);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const refreshToken: string = req.cookies?.['refreshToken'];
    console.log(refreshToken, 'refreshToken');
    if (!refreshToken) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }

    const { sessionToken, user } =
      await this.authService.refreshTokens(refreshToken);

    // issue new short-term session
    this.authCookieService.setSessionCookie(res, sessionToken);

    return { user };
  }
}
