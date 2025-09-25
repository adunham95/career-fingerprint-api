import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  lastName?: string;

  @MinLength(6)
  @ApiProperty()
  password: string;

  @MinLength(4)
  @ApiProperty()
  @IsOptional()
  username?: string;

  @MinLength(4)
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  orgID?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  timezone?: string;
}
