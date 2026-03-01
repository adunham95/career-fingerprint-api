import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CacheService } from 'src/cache/cache.service';
import { PermissionsService } from 'src/permission/permission.service';

@Injectable()
export class SessionOrJwtGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private subscriptionService: SubscriptionsService,
    private cache: CacheService,
    private permissionService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('validate', context);
    const req = context.switchToHttp().getRequest<Request>();
    const sessionID = req.cookies?.sessionAccessToken as string | undefined;

    if (sessionID) {
      const session = await this.authService.getSession(sessionID);
      if (session) {
        const user = await this.cache.wrap(
          `currentUser:${session.userID}`,
          () => this.usersService.getCurrentUser(session.userID),
        );

        if (!user?.id) {
          throw new UnauthorizedException();
        }

        if (user?.id) {
          const subscription =
            (await this.subscriptionService.getActive(user?.id)) || undefined;

          const permissionList = this.permissionService.getPermissionsForRoles(
            [],
          );

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...currentUser } = user;
          req.user = {
            ...currentUser,
            password: '',
            planLevel: subscription?.plan?.level ?? 0,
            subscription,
            // sessionID,
            permissionList,
          } as unknown as NonNullable<Request['user']>;
          return true;
        }
      }
    }

    // Fall back to JWT Passport strategy
    const jwtGuard = new (AuthGuard('jwt'))();
    return jwtGuard.canActivate(context) as Promise<boolean>;
  }
}
