import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrgUserDto {
  email: string;

  firstName: string;

  lastName: string;

  orgID: string;
}

export class CreateOrgAdminDto {
  email: string;

  firstName: string;

  lastName: string;

  roles: string[];

  orgID: string;
}

export class InviteClientDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @MinLength(4)
  @ApiProperty()
  @IsEmail()
  email: string;

  orgID: string;
}
