import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsInt, IsOptional, IsString } from 'class-validator';

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
  couponID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inviteCode: string;

  user: User;
}

export class CreateStripeOrgSubscriptionDto {
  @ApiProperty()
  @IsString()
  priceID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  couponID: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inviteCode: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  quantity: number;

  user: User;
}
