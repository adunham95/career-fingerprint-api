import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class SessionOrJwtGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private subscriptionsService: SubscriptionsService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const sessionID = req.cookies?.sessionAccessToken as string | undefined;

    if (sessionID) {
      const session = await this.authService.getSession(sessionID);
      if (session) {
        const user = await this.cache.wrap(
          `currentUser:${session.userID}`,
          () => this.usersService.getCurrentUser(session.userID),
        );
        if (user?.id) {
          const subscription = await this.subscriptionsService.getActive(
            user.id,
          );
          const { password, ...currentUser } = user;
          req.user = {
            ...currentUser,
            planLevel: subscription?.plan?.level ?? 0,
            subscription,
            sessionID,
          };
          return true;
        }
      }
    }

    // Fall back to JWT Passport strategy
    const jwtGuard = new (AuthGuard('jwt'))();
    return jwtGuard.canActivate(context) as Promise<boolean>;
  }
}
