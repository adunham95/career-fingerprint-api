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

  @Get('plans/:key')
  getPlanByKey(@Param('id') id: string) {
    return this.subscriptionsService.findPlanByID(id);
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
