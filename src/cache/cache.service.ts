import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return (await this.cache.get(key)) as T | null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await this.cache.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async wrap<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await fetchFn();
    if (value !== undefined && value !== null) {
      await this.set(key, value, ttlSeconds);
    }
    return value;
  }
}
