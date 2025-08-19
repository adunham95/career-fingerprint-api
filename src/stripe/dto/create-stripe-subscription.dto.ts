import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class CreateStripeSubscriptionDto {
  @ApiProperty()
  @IsString()
  priceID: string;

  @ApiProperty()
  @IsString()
  planID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inviteCode: string;

  user: User;
}
