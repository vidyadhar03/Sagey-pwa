/**
 * AI Insight Cache Service
 * Supports Redis with in-memory LRU fallback when Redis is unavailable
 */

// Simple in-memory LRU cache implementation
class LRUCache {
  private cache = new Map<string, { value: string; expiry: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: string, ttlMinutes: number): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, { value, expiry });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global in-memory cache instance
const memoryCache = new LRUCache();

// Redis client (lazy initialization)
let redisClient: any = null;

async function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid bundling Redis in client
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      
      // Test connection
      await redisClient.ping();
      console.log('✅ Connected to Redis for AI insight caching');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, falling back to in-memory cache:', error);
      redisClient = null;
    }
  }
  return redisClient;
}

/**
 * Get cached value by key
 */
export async function getCachedValue(key: string): Promise<string | null> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const value = await redis.get(key);
      return value;
    }
  } catch (error) {
    console.warn('Redis get failed, using memory cache:', error);
  }

  // Fallback to memory cache
  return memoryCache.get(key);
}

/**
 * Set cached value with TTL
 */
export async function setCachedValue(key: string, value: string, ttlMinutes: number): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.setex(key, ttlMinutes * 60, value);
      return;
    }
  } catch (error) {
    console.warn('Redis set failed, using memory cache:', error);
  }

  // Fallback to memory cache
  memoryCache.set(key, value, ttlMinutes);
}

/**
 * Generate cache key for AI insights
 */
export function generateCacheKey(userId: string, type: string, dataHash: string): string {
  return `ai_insight:${userId}:${type}:${dataHash}`;
}

/**
 * Create hash from insight payload for cache key
 */
export function hashInsightData(data: any): string {
  // Simple deterministic hash based on JSON string
  const str = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Clear all AI insight caches (useful for testing)
 */
export async function clearCache(): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const keys = await redis.keys('ai_insight:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (error) {
    console.warn('Redis cache clear failed:', error);
  }

  memoryCache.clear();
} 