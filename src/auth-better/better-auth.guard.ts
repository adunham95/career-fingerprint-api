import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CacheService } from 'src/cache/cache.service';
import { PermissionsService } from 'src/permission/permission.service';
import { SessionOrJwtGuard } from 'src/auth/session-auth.guard';
import { Auth } from 'src/auth/better-auth';

/**
 * Drop-in replacement for SessionOrJwtGuard that checks Better Auth sessions
 * first and falls back to the legacy Redis/JWT guard.
 *
 * Route-by-route migration plan (Phase 6):
 *   1. Apply @UseGuards(BetterAuthGuard) to a route
 *   2. Confirm it works in staging with both old and new session cookies
 *   3. Remove the legacy SessionOrJwtGuard from that route
 *
 * Eventually this guard replaces SessionOrJwtGuard entirely and the legacy
 * fallback path below can be removed.
 */
@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly baAuthService: AuthService<Auth>,
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly cache: CacheService,
    private readonly permissionService: PermissionsService,
    private readonly legacyGuard: SessionOrJwtGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // -----------------------------------------------------------------------
    // 1. Try Better Auth session (cookie: cf.session_token)
    // -----------------------------------------------------------------------
    const baSession = await this.baAuthService.instance.api
      .getSession({ headers: fromNodeHeaders(req.headers) })
      .catch(() => null);

    if (baSession?.session && baSession.user) {
      // baSession.user.id === User.baId (cuid) — load the full app user
      const user = await this.cache.wrap(
        `currentUser:ba:${baSession.user.id}`,
        () =>
          this.prisma.user.findFirst({
            where: { baId: baSession.user.id },
          }),
      );

      if (!user?.id) {
        throw new UnauthorizedException();
      }

      const subscription =
        (await this.subscriptionService.getActive(user.id)) || undefined;

      const permissionList = this.permissionService.getPermissionsForRoles([]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user;
      req.user = {
        ...safeUser,
        password: '',
        planLevel: subscription?.plan?.level ?? 0,
        subscription,
        permissionList,
      } as unknown as NonNullable<Request['user']>;

      return true;
    }

    // -----------------------------------------------------------------------
    // 2. Fall back to legacy Redis session + JWT guard
    // -----------------------------------------------------------------------
    return this.legacyGuard.canActivate(context);
  }
}
