import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CacheService } from 'src/cache/cache.service';
import { HAS_FEATURE_KEY } from 'src/decorators/has-feature.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlag } from 'src/utils/featureFlags';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cache: CacheService,
    private prisma: PrismaService,
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

    console.log(user);

    const sub = await this.cache.wrap(
      `activeUserSubscription:${user.id}`,
      () => {
        return this.prisma.subscription.findFirst({
          where: {
            userID: user.id,
            status: {
              in: [
                'trialing',
                'active',
                'past_due',
                'temp',
                'org-managed',
                'canceling',
              ],
            },
            OR: [
              { currentPeriodEnd: null },
              { currentPeriodEnd: { gt: new Date() } },
            ], // optional: time-safe check
          },
          include: {
            plan: true,
          },
          orderBy: [
            {
              plan: {
                level: 'desc', // highest plan level first
              },
            },
            {
              createdAt: 'desc', // newest first
            },
          ],
        });
      },
      86400,
    );

    const hasAccess = sub?.plan?.features.includes(feature);
    if (!hasAccess)
      throw new ForbiddenException('Feature not available in your plan');
    return true;
  }
}
