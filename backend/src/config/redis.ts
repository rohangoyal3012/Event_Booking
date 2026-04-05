import Redis from "ioredis";
import { config } from "./index";
import { logger } from "../utils/logger";

const redisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.error("Redis: max reconnection attempts reached");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
};

export const redis = new Redis(redisOptions);

redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));

// Separate connection for BullMQ (cannot share connections)
export const redisForBullMQ = new Redis(redisOptions);

// ─── Cache helpers ────────────────────────────────────────────────────────────

export const CacheKeys = {
  event: (id: string) => `event:${id}`,
  eventSlug: (slug: string) => `event:slug:${slug}`,
  eventList: (page: number, filters: string) =>
    `events:list:${page}:${filters}`,
  userProfile: (id: string) => `user:${id}`,
  ticketCategories: (eventId: string) => `event:${eventId}:tickets`,
};

export const TTL = {
  event: 300, // 5 min
  eventList: 60, // 1 min
  userProfile: 600, // 10 min
  tickets: 120, // 2 min
};

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

// Distributed lock using SET NX
export async function acquireLock(
  lockKey: string,
  ttlMs = 5000,
): Promise<boolean> {
  const result = await redis.set(lockKey, "1", "PX", ttlMs, "NX");
  return result === "OK";
}

export async function releaseLock(lockKey: string): Promise<void> {
  await redis.del(lockKey);
}
