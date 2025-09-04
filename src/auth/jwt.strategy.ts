import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private usersService: UsersService,
    private subscriptionService: SubscriptionsService,
    private cache: CacheService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        console.log('jwt from request', req.cookies);
        if (req?.cookies?.accessToken) {
          console.log('has cookie');
          return req.cookies.accessToken as string;
        }

        const authHeader = req?.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          return authHeader.slice(7);
        }

        return null;
      },
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { userID: number }) {
    console.log('validate');
    console.log({ payload });
    const user = await this.cache.wrap(`currentUser:${payload.userID}`, () => {
      return this.usersService.user(
        { id: payload.userID },
        { orgs: { select: { id: true, name: true } } },
      );
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const subscription = await this.subscriptionService.getActive(user?.id);

    const planLevel = subscription?.plan?.level ?? 0; // 0 = Free

    console.log({ user });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...currentUser } = user;

    return { ...currentUser, planLevel, subscription };
  }
}
