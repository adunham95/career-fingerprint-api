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
import {
  CreateStripeOrgSubscriptionDto,
  CreateStripeSubscriptionDto,
} from './dto/create-stripe-subscription.dto';

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
    createStripeSubscriptionDto.user = req.user;
    return this.stripeService.createTrialSubscription(
      createStripeSubscriptionDto,
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
      createCheckoutSessionDto.couponID,
    );
  }

  @Post('create-checkout-session/org')
  @UseGuards(JwtAuthGuard)
  createCheckoutOrgSession(
    @Body() createCheckoutSessionDto: CreateStripeOrgSubscriptionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.stripeService.createCheckoutSessionForOrg(
      req.user,
      createCheckoutSessionDto.priceID,
      createCheckoutSessionDto.quantity,
      createCheckoutSessionDto.couponID,
    );
  }

  @Post('update-billing')
  @UseGuards(JwtAuthGuard)
  updateBilling(@Req() req: Request) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.stripeService.updateBillingDetails(req.user);
  }

  @Get('validate/:checkoutSession')
  validateSubscription(@Param('checkoutSession') checkoutSession: string) {
    return this.stripeService.validateSubscription(checkoutSession);
  }

  @Post('validate-promo')
  async validatePromo(@Body('code') code: string) {
    return this.stripeService.validatePromo(code);
  }

  @Post('estimate')
  @UseGuards(JwtAuthGuard)
  async estimate(
    @Req() req: Request,
    @Body()
    createEstimateDto: {
      promoID?: string;
      priceID: string;
      stripeCustomerID: string;
    },
  ) {
    if (req?.user?.stripeCustomerID) {
      createEstimateDto.stripeCustomerID = req.user.stripeCustomerID;
    }
    return this.stripeService.estimate(createEstimateDto);
  }
}
