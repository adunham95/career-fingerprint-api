import { Module } from '@nestjs/common';
import { AuthCookieService } from './authcookie.service';

@Module({
  providers: [AuthCookieService],
  exports: [AuthCookieService],
})
export class AuthCookieModule {}
