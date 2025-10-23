import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateOrgDto {
  name: string;
  domain: string;
}

export class UpdateOrgSubscriptionDto {
  @ApiProperty()
  @IsNumber()
  userCount: number;

  @ApiProperty()
  @IsString()
  stripeSubscriptionID: string;

  @ApiProperty()
  @IsString()
  subscriptionType: string;
}
