import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  lastName?: string;

  @MinLength(4)
  @ApiProperty()
  @IsOptional()
  username?: string;

  @MinLength(4)
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsString()
  @ApiProperty()
  orgID?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  timezone?: string;
}
