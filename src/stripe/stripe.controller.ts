import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { CreateStripeSubscriptionDto } from './dto/create-stripe-subscription.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('trial')
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createStripeSubscriptionDto: CreateStripeSubscriptionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.stripeService.createTrialSubscription(
      req.user,
      createStripeSubscriptionDto.priceID,
    );
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateStripeSubscriptionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.stripeService.createCheckoutSession(
      req.user,
      createCheckoutSessionDto.priceID,
    );
  }

  @Get('validate/:checkoutSession')
  validateSubscription(@Param('checkoutSession') checkoutSession: string) {
    return this.stripeService.validateSubscription(checkoutSession);
  }
}
