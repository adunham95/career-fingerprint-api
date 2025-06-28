import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { MIN_PLAN_LEVEL_KEY } from 'src/decorators/min-plan-level.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minRequiredLevel = this.reflector.get<number>(
      MIN_PLAN_LEVEL_KEY,
      context.getHandler(),
    );

    if (minRequiredLevel === undefined) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user; // Assumes you've added user to request (e.g., with AuthGuard)
    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get the user's most recent active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userID: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    const userPlanLevel = subscription?.plan?.level || 0;

    if (userPlanLevel < minRequiredLevel) {
      throw new ForbiddenException(
        `Plan level too low. Required: ${minRequiredLevel}, yours: ${userPlanLevel}`,
      );
    }

    return true;
  }
}
