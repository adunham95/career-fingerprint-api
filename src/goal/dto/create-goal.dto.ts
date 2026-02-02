import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateMilestonesDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  keywords: string[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  streak: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  targetCount: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklist: string[];
}

export class CreateGoalDto {
  userID: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  templateKey?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestonesDto)
  milestones: CreateMilestonesDto[];
}

export class GoalQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsBooleanString()
  active?: boolean;

  @IsOptional()
  @IsBooleanString()
  showProgress?: boolean;
}
