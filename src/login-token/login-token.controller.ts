import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { LoginTokenService } from './login-token.service';

@Controller('login-token')
export class LoginTokenController {
  constructor(private readonly loginTokenService: LoginTokenService) {}

  @Get('verify/:token')
  verifyLoginToken(@Param('token') token: string) {
    return this.loginTokenService.verifyLoginToken(token);
  }

  @Get('create/:email')
  generateLoginToken(@Param('email') email: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Not allowed in production');
    }
    return this.loginTokenService.createLoginToken(email, 'check-in');
  }
}
