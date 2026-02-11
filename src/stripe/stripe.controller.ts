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
  CreateStripeCoachSubscriptionDto,
  CreateStripeOrgSubscriptionDto,
  CreateStripeSubscriptionDto,
} from './dto/create-stripe-subscription.dto';
import { CacheService } from 'src/cache/cache.service';
import { RequirePermission } from 'src/permission/permission.decorator';
import { OrgMemberGuard } from 'src/org/org-admin.guard';
import { PermissionGuard } from 'src/permission/permission.guard';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private cache: CacheService,
  ) {}

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
      createCheckoutSessionDto.orgID,
      createCheckoutSessionDto.couponID,
    );
  }

  @Post('create-checkout-session/coach')
  @UseGuards(JwtAuthGuard)
  createCheckoutCoachSession(
    @Body() createCheckoutSessionDto: CreateStripeCoachSubscriptionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.stripeService.createCheckoutSessionForCoach(
      req.user,
      createCheckoutSessionDto.planID,
      createCheckoutSessionDto.orgID,
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
  @UseGuards(JwtAuthGuard)
  async validateSubscription(
    @Param('checkoutSession') checkoutSession: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    await this.cache.del(`activeUserSubscription:${req.user.id}`);
    return this.stripeService.validateSubscription(checkoutSession);
  }

  @Post('validate-promo')
  async validatePromo(@Body('code') code: string) {
    return this.stripeService.validatePromo(code);
  }

  @Post('estimate')
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

  @Post('create-promo-code')
  @RequirePermission('org:create_promo_code')
  @UseGuards(JwtAuthGuard, OrgMemberGuard, PermissionGuard)
  async createPromoCode(
    @Req() req: Request,
    @Body()
    createPromoCodeDto: {
      promoCodeText: string;
    },
  ) {
    const orgID = req.user?.orgID;
    return this.stripeService.createPromoCode(
      createPromoCodeDto.promoCodeText,
      orgID,
    );
  }
}
