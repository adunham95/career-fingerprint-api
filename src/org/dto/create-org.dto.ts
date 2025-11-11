import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrgDto {
  @ApiProperty()
  @IsString()
  orgName: string;

  @ApiProperty({ default: 100 })
  @IsNumber()
  @IsOptional()
  orgSize: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  orgDomain: string;

  @ApiProperty()
  @IsString()
  orgEmail: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  orgLogo: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  admin?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  planKey?: string;
}
