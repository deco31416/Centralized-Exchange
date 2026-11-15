import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Redis service for caching, rate limiting, and temporary storage
 */
@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

  /**
   * Sets a key-value pair with optional TTL
   */
  async setValue(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Gets a value by key
   */
  async getValue(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * Deletes a key
   */
  async deleteKey(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Checks if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * Increments a counter with TTL
   */
  async incrementCounter(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds);
    const results = await pipeline.exec();
    return results?.[0]?.[1] as number;
  }

  /**
   * Gets current counter value
   */
  async getCounter(key: string): Promise<number> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Sets hash field value
   */
  async setHashField(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  /**
   * Gets hash field value
   */
  async getHashField(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  /**
   * Gets all hash fields
   */
  async getAllHashFields(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  /**
   * Deletes hash field
   */
  async deleteHashField(key: string, field: string): Promise<void> {
    await this.redis.hdel(key, field);
  }

  /**
   * Sets TTL on existing key
   */
  async setTtl(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }

  /**
   * Gets remaining TTL
   */
  async getTtl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  /**
   * Adds member(s) to a set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.redis.sadd(key, ...members);
  }

  /**
   * Checks if member is in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  /**
   * Sets expiration on key (alias for setTtl)
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }

  /**
   * Sets a value with TTL (alias for setValue)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.setValue(key, value, ttlSeconds);
  }

  /**
   * Gets a value (alias for getValue)
   */
  async get(key: string): Promise<string | null> {
    return await this.getValue(key);
  }

  /**
   * Deletes a key (alias for deleteKey)
   */
  async del(key: string): Promise<void> {
    await this.deleteKey(key);
  }
}
