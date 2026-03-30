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
import { HasFeature } from 'src/decorators/has-feature.decorator';
import { FeatureGuard } from 'src/auth/feature.guard';
import { FeatureFlags } from 'src/utils/featureFlags';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('thank-yous')
export class ThankYousController {
  constructor(private readonly thankYousService: ThankYousService) {}

  @Post()
  @HasFeature(FeatureFlags.ThankYouCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  create(@Body() createThankYousDto: CreateThankYousDto, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.create(req.user, createThankYousDto);
  }

  @Get('meeting/:id')
  @HasFeature(FeatureFlags.ThankYouCreate)
  @UseGuards(BetterAuthGuard, FeatureGuard)
  getByMeetings(@Param('id') meetingID: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.thankYousService.getByMeeting(req.user.id, meetingID);
  }
}
