import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // @ApiOkResponse({ type: AuthEntity })
  async login(
    @Body() { username, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken } = await this.authService.loginUser(
      username,
      password,
    );
    console.log({ accessToken, secure: process.env.NODE_ENV === 'production' });
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });
    return { accessToken };
  }

  //   @Post('request-reset')
  //   async requestPasswordReset(@Body() { email }: InitiatePasswordResetDto) {
  //     return this.authService.generateResetToken(email);
  //   }

  //   @Post('reset-password')
  //   async requestPassword(@Body() { password, token }: PasswordResetDto) {
  //     return this.authService.resetFromToken(password, token);
  //   }

  //   @Get('profile')
  //   @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @ApiOkResponse({ type: UserEntity })
  //   user(@Req() req: Request) {
  //     return new UserEntity(req.user);
  //   }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    response.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1,
    });
    return { success: true };
  }
}
