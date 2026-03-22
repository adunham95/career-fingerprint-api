import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Request } from 'express';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    createSubscriptionDto.userID = req.user.id;

    return this.subscriptionsService.createOrgManagedSubscription(
      createSubscriptionDto,
      'addToOrg',
    );
  }

  @Post('temp-access')
  @UseGuards(BetterAuthGuard)
  async createTempSubscription(
    @Body()
    { priceID, sessionID }: { priceID: string; sessionID: string },
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    await this.subscriptionsService.createTempSubscription(
      priceID,
      sessionID,
      req.user.id,
    );
    return { success: true };
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.findPlans();
  }

  @Get('plans/available')
  @UseGuards(BetterAuthGuard)
  getPlansAvailableToUpgrade(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log('req.user', req.user.planLevel);
    return this.subscriptionsService.findUpgradePlan(req.user?.planLevel);
  }

  @Get('plans/type/:id')
  @UseGuards(BetterAuthGuard)
  getPlansByType(@Req() req: Request, @Param('id') type: string) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    console.log('req.user', req.user.planLevel);
    return this.subscriptionsService.findPlanByType(type);
  }

  @Get('plans/:key')
  getPlanByKey(@Param('key') key: string) {
    return this.subscriptionsService.findPlanByID(key);
  }

  @Get('details')
  @UseGuards(BetterAuthGuard)
  getCurrentSubscription(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.subscriptionsService.getActive(req.user.id);
  }

  @Delete('cancel/:id')
  @UseGuards(BetterAuthGuard)
  cancelCurrentSubscription(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.subscriptionsService.cancelCurrentSubscription(id);
  }
}
