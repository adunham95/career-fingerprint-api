import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOnboardingAchievementDto } from './dto/create-onboarding-achievement.dto';
import { CreateOnboardingJobDto } from './dto/create-onboarding-job.dto';
import { OnboardingService } from './onboarding.service';
import { Request } from 'express';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * @deprecated built into add achievement
   */
  @Post('new/job')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createJob(@Body() dto: CreateOnboardingJobDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    dto.userID = req.user.id;
    return this.onboardingService.createJob(dto);
  }

  @Post('new/achievement')
  @UseGuards(BetterAuthGuard)
  @ApiBearerAuth()
  createAchievement(
    @Body() dto: CreateOnboardingAchievementDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    dto.userID = req.user.id;
    return this.onboardingService.createAchievement(dto);
  }
}
