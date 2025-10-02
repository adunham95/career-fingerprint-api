import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FailedLoginService {
  private readonly MAX_ATTEMPTS = 5; // configurable
  private readonly BLOCK_TTL = 60 * 15; // 15 minutes in seconds
  private readonly ATTEMPT_TTL = 60 * 15; // reset failures after 15 min

  constructor(private readonly cache: CacheService) {}

  private key(email: string) {
    return `failed-login:${email.toLowerCase()}`;
  }

  async recordFailure(email: string): Promise<number> {
    const key = this.key(email);

    const current = (await this.cache.get<number>(key)) || 0;
    const next = current + 1;

    await this.cache.set(key, next, this.ATTEMPT_TTL);

    return next;
  }

  async isBlocked(email: string): Promise<boolean> {
    const failures = (await this.cache.get<number>(this.key(email))) || 0;
    return failures >= this.MAX_ATTEMPTS;
  }

  async resetFailures(email: string): Promise<void> {
    await this.cache.del(this.key(email));
  }
}
