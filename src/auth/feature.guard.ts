import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { HAS_FEATURE_KEY } from 'src/decorators/has-feature.decorator';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { FeatureFlag } from 'src/utils/featureFlags';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionsService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<FeatureFlag>(
      HAS_FEATURE_KEY,
      ctx.getHandler(),
    );
    if (!feature) return true;

    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const sub = await this.subscriptionService.getActive(user?.id);

    const hasAccess = sub?.plan?.features.includes(feature);
    if (!hasAccess)
      throw new ForbiddenException('Feature not available in your plan');
    return true;
  }
}
