import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private usersService: UsersService,
    private subscriptionService: SubscriptionsService,
    private cache: CacheService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        this.logger.verbose('request cookies', req.cookies);
        if (req?.cookies?.accessToken) {
          this.logger.debug('Has Access Token Cookie');
          return req.cookies.accessToken as string;
        }

        const authHeader = req?.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          this.logger.debug('Has Bearer Token');
          return authHeader.slice(7);
        }

        return null;
      },
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { userID: number }) {
    this.logger.debug('validate', payload);
    const user = await this.cache.wrap(`currentUser:${payload.userID}`, () => {
      return this.usersService.user(
        { id: payload.userID },
        { orgs: { select: { id: true, name: true, logoURL: true } } },
      );
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const subscription = await this.subscriptionService.getActive(user?.id);

    const planLevel = subscription?.plan?.level ?? 0; // 0 = Free

    this.logger.debug('current user details', user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...currentUser } = user;

    return { ...currentUser, planLevel, subscription };
  }
}
