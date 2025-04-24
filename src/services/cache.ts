import { getRedisClient } from '@/lib/redis';
import Redis from 'ioredis';
import crypto from 'crypto';

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10);

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  generateKey(prefix: string, ...args: string[]): string;
}

class RedisCacheService implements CacheService {
  private redisClient: Redis | null;

  constructor() {
    this.redisClient = getRedisClient();
  }

  generateKey(prefix: string, ...args: string[]): string {
    const hash = crypto.createHash('sha256');
    const data = args.join('|');
    hash.update(data);
    return `${prefix}:${hash.digest('hex')}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisClient) {
      return null; // Caching disabled
    }
    try {
      const cachedResult = await this.redisClient.get(key);
      if (cachedResult) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(cachedResult) as T;
      }
      console.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null; // Treat Redis error as cache miss
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<void> {
    if (!this.redisClient) {
      return; // Caching disabled
    }
    try {
      await this.redisClient.setex(
        key,
        ttlSeconds,
        JSON.stringify(value)
      );
      console.log(`Cached result for key: ${key} with TTL ${ttlSeconds}s`);
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      // Don't fail the operation if caching fails
    }
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    // Check if Redis is configured, otherwise use a NoOp cache or just return null/error?
    // For now, let's stick with RedisCacheService which handles null client internally.
    cacheServiceInstance = new RedisCacheService();
  }
  return cacheServiceInstance;
} 