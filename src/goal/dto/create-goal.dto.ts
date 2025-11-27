import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  userID: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  keywords: string[];

  @ApiProperty()
  @IsArray()
  actions: string[];

  @ApiProperty()
  @IsNumber()
  targetCount: number;
}

export class GoalQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsBooleanString()
  active?: boolean;

  @IsOptional()
  @IsBooleanString()
  showProgress?: boolean;
}
