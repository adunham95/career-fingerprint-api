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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('prep')
export class PrepController {
  constructor(private readonly prepService: PrepService) {}

  @Get('questions')
  findAll() {
    return this.prepService.findAllPrepQuestions();
  }

  @Get('questions/meeting/:id')
  @UseGuards(JwtAuthGuard)
  findAllForMeeting(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.prepService.findAllPrepQuestionsForMeeting(id, req.user.id);
  }

  @Patch('answer')
  @UseGuards(JwtAuthGuard)
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
