import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PrepService } from './prep.service';
import { UpsertPrepAnswerDto } from './dto/upsert-prep-answer.dto';
import { Request } from 'express';
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('prep')
export class PrepController {
  constructor(private readonly prepService: PrepService) {}

  @Get('questions')
  @HasFeature(FeatureFlags.MeetingPrep)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAll() {
    return this.prepService.findAllPrepQuestions();
  }

  @Get('questions/meeting/:id')
  @HasFeature(FeatureFlags.MeetingPrep)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAllQForMeeting(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.prepService.findAllPrepQuestionsForMeeting(id, req.user.id);
  }

  @Get('answers/meeting/:id')
  @HasFeature(FeatureFlags.MeetingPrep)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  findAllAForMeeting(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.prepService.findAllPrepAnswersForMeeting(id, req.user.id);
  }

  @Patch('answer')
  @HasFeature(FeatureFlags.MeetingPrep)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  upsertAnswer(
    @Body() upsertAnswerDto: UpsertPrepAnswerDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    upsertAnswerDto.userID = req.user.id;
    return this.prepService.addPrepAnswer(upsertAnswerDto);
  }
}
