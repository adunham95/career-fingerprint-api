import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDomainDto {
  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiProperty()
  @IsString()
  orgID: string;
}
