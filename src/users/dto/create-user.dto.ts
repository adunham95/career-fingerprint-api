import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @ApiProperty()
  @Optional()
  @IsString()
  firstName?: string;

  @Optional()
  @IsString()
  @ApiProperty()
  lastName?: string;

  @MinLength(6)
  @ApiProperty()
  password: string;

  @MinLength(4)
  @ApiProperty()
  username: string;
}
