import Redis from "ioredis";

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let redisDisabledUntil = 0;

/**
 * Initialize Redis client with connection pooling and retry logic
 */
export function getRedisClient(): Redis | null {
  // Return existing client if available
  if (redisClient && isRedisAvailable) {
    return redisClient;
  }

  // If recently disabled due DNS/network issues, fail-open without reconnect storm
  if (Date.now() < redisDisabledUntil) {
    return null;
  }

  // Check if Redis URL is configured
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn("[Cache] REDIS_URL not configured, caching disabled");
    return null;
  }

  try {
    // Parse Redis URL
    const url = new URL(redisUrl);
    
    redisClient = new Redis(redisUrl, {
      // Connection options
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Connection pool options
      enableReadyCheck: true,
      enableOfflineQueue: false, // Don't queue commands when offline
      // Lazy connect - connect only when needed
      lazyConnect: true,
    });

    // Handle connection events
    redisClient.on("connect", () => {
      console.log("[Cache] Redis connected");
      isRedisAvailable = true;
    });

    redisClient.on("ready", () => {
      console.log("[Cache] Redis ready");
      isRedisAvailable = true;
    });

    redisClient.on("error", (error) => {
      console.error("[Cache] Redis error:", error.message);
      isRedisAvailable = false;

      // DNS failures can create reconnect storms that impact app requests.
      // Temporarily disable Redis and fail-open to DB-only mode.
      if (error.message?.includes("ENOTFOUND")) {
        redisDisabledUntil = Date.now() + 5 * 60 * 1000; // 5 min cooldown
        try {
          redisClient?.disconnect();
        } catch {}
        redisClient = null;
        console.warn("[Cache] Redis temporarily disabled (DNS failure), using DB fallback");
      }
      // Don't throw - graceful degradation
    });

    redisClient.on("close", () => {
      console.log("[Cache] Redis connection closed");
      isRedisAvailable = false;
    });

    redisClient.on("reconnecting", () => {
      console.log("[Cache] Redis reconnecting...");
    });

    // Attempt to connect
    redisClient.connect().catch((error) => {
      console.warn("[Cache] Failed to connect to Redis:", error.message);
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error("[Cache] Failed to initialize Redis:", error);
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Check if Redis is available
 */
export function isCacheAvailable(): boolean {
  const client = getRedisClient();
  return client !== null && isRedisAvailable;
}

/**
 * Get cache value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return null;
  }

  try {
    const value = await client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error);
    return null;
  }
}

/**
 * Set cache value with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cache key
 */
export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple cache keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return 0;
  }

  try {
    const keys: string[] = [];
    let cursor = "0";

    do {
      const result = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== "0");

    if (keys.length === 0) {
      return 0;
    }

    const deleted = await client.del(...keys);
    return deleted;
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get or set cache value (cache-aside pattern)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  // #region agent log
  const cacheCheckStart = Date.now();
  // #endregion
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    // #region agent log
    const cacheTime = Date.now() - cacheCheckStart;
    fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/redis.ts:202',message:'Cache hit',data:{key,cacheTime},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return cached;
  }

  // #region agent log
  const fetchStart = Date.now();
  // #endregion
  // Cache miss - fetch from source
  const value = await fetcher();
  // #region agent log
  const fetchTime = Date.now() - fetchStart;
  const cacheTime = Date.now() - cacheCheckStart;
  fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/redis.ts:210',message:'Cache miss',data:{key,fetchTime,cacheTime},sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Store in cache (fire and forget)
  setCache(key, value, ttlSeconds).catch((error) => {
    console.error(`[Cache] Failed to cache key ${key}:`, error);
  });

  return value;
}

/**
 * Invalidate cache and related patterns
 */
export async function invalidateCache(
  keys: string[],
  patterns: string[] = []
): Promise<void> {
  const client = getRedisClient();
  if (!client || !isRedisAvailable) {
    return;
  }

  try {
    // Delete specific keys
    if (keys.length > 0) {
      await client.del(...keys);
    }

    // Delete pattern matches
    for (const pattern of patterns) {
      await deleteCachePattern(pattern);
    }
  } catch (error) {
    console.error("[Cache] Error invalidating cache:", error);
  }
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisAvailable = false;
  }
}
