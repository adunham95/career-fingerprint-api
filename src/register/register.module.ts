import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService],
  imports: [PrismaModule, UsersModule, AuthModule, StripeModule],
})
export class RegisterModule {}
