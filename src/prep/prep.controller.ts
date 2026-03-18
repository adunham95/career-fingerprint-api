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
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('prep')
export class PrepController {
  constructor(private readonly prepService: PrepService) {}

  @Get('questions')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findAll() {
    return this.prepService.findAllPrepQuestions();
  }

  @Get('questions/meeting/:id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findAllQForMeeting(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.prepService.findAllPrepQuestionsForMeeting(id, req.user.id);
  }

  @Get('answers/meeting/:id')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
  findAllAForMeeting(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.prepService.findAllPrepAnswersForMeeting(id, req.user.id);
  }

  @Patch('answer')
  @MinPlanLevel(2)
  @UseGuards(BetterAuthGuard, SubscriptionGuard)
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
