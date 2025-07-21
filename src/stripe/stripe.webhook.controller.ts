// import { Controller, Header, Post, Req, Res } from '@nestjs/common';
// import { StripeService } from './stripe.service';
// import { Request, Response } from 'express';

// @Controller('stripe')
// export class StripeWebhookController {
//   constructor(private readonly stripeService: StripeService) {}

//   @Post('webhook')
//   @Header('Content-Type', 'application/json')
//   handleWebhook(@Req() req: Request, @Res() res: Response) {
//     const sig = req.headers['stripe-signature'];
//     const rawBody = (req as any).rawBody;
//     let event;

//     try {
//       event = this.stripe.webhooks.constructEvent(
//         rawBody,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET,
//       );
//     } catch (err) {
//       console.log(`Webhook error: ${err.message}`);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     switch (event.type) {
//       case 'checkout.session.completed':
//         const session = event.data.object;
//         // Handle checkout completion
//         break;
//       // ... other cases
//     }

//     res.json({ received: true });
//   }
// }

import {
  Controller,
  Post,
  Req,
  Res,
  Inject,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhookController {
  // constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) {}
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_SECRET')
    private readonly secretKey: string,
    @Inject('FRONT_END_URL')
    private readonly frontEndUrl: string,
  ) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  @Post()
  handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw Error('Missing stripe key');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.error('Webhook Error:', err?.message);
      return res.status(400).send(`Webhook Error: ${err?.message}`);
    }
    // 🎯 Handle the event
    switch (event.type) {
      case 'customer.updated':
        const customerUpdated = event.data.object;
        console.log('✅ Customer Updated:', customerUpdated);
        // Then define and call a function to handle the event customer.updated
        break;
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout complete:', session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('✅ Invoice paid:', invoice.id);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(' Invoice payment failed:', invoice.id);
        break;
      }
      case 'customer.subscription.created': {
        const newSubscription = event.data.object;
        console.log('✅ New Subscription:', newSubscription);
        break;
      }
      case 'customer.subscription.updated': {
        const newSubscription = event.data.object;
        console.log('✅ New Subscription:', newSubscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const newSubscription = event.data.object;
        console.log('✅ New Subscription:', newSubscription);
        break;
      }
      case 'customer.subscription.trial_will_end': {
        console.log('trial will end');
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(HttpStatus.OK).send({ received: true });
  }
}
