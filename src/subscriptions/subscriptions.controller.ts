import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.findPlans();
  }

  @Get('plans/available')
  @UseGuards(JwtAuthGuard)
  getPlansAvailableToUpgrade(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log('req.user', req.user.planLevel);
    return this.subscriptionsService.findUpgradePlan(req.user?.planLevel);
  }

  @Get('plans/:key')
  getPlanByKey(@Param('key') key: string) {
    return this.subscriptionsService.findPlanByID(key);
  }

  @Get('details')
  @UseGuards(JwtAuthGuard)
  getCurrentSubscription(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.subscriptionsService.getActive(req.user.id);
  }
}
