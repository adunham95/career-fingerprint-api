import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateStripeSubscriptionDto {
  @ApiProperty()
  @IsString()
  priceID: string;

  user: User;
}
