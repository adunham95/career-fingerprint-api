import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { ThankYousService } from './thank-yous.service';
import { CreateThankYousDto } from './dto/create-thank-yous.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MinPlanLevel } from 'src/decorators/min-plan-level.decorator';
import { SubscriptionGuard } from 'src/auth/subscription.guard';

@Controller('thank-yous')
export class ThankYousController {
  constructor(private readonly thankYousService: ThankYousService) {}

  @Post()
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  create(@Body() createThankYousDto: CreateThankYousDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.create(req.user, createThankYousDto);
  }

  @Get('meeting/:id')
  @MinPlanLevel(1)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  getByMeetings(@Param('id') meetingID: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.getByMeeting(req.user.id, meetingID);
  }
}
