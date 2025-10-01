import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRegisterDto {
  firstName: string;
  lastName: string;
  lookingFor: string;
  companyName: string;
  title: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  email: string;
  password: string;
  achievement: string;
  inviteCode: string;
  orgID: string;
  timezone: string;
}

export class CreateRegisterOrgDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @MinLength(4)
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  orgName: string;

  @ApiProperty({ default: 100 })
  @IsNumber()
  @IsOptional()
  orgSize: number;

  @ApiProperty()
  @IsString()
  orgDomain: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  orgLogo: string;

  @ApiProperty()
  @IsEmail()
  orgEmail: string;
}
