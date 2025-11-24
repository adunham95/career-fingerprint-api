import { Module } from '@nestjs/common';
import { LoginTokenService } from './login-token.service';
import { LoginTokenController } from './login-token.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuditModule } from 'src/audit/audit.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [LoginTokenController],
  providers: [LoginTokenService],
  imports: [PrismaModule, AuditModule, AuthModule],
  exports: [LoginTokenService],
})
export class LoginTokenModule {}
