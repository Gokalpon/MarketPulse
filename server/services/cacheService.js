import Redis from 'ioredis';

// In-memory fallback for development (when Redis is not available)
const memoryCache = new Map();

// Redis client configuration with fallback
let redis = null;
let useMemoryCache = false;
const shouldUseRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

try {
  if (!shouldUseRedis) {
    throw new Error('REDIS_HOST not configured');
  }

  redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })
    : new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            console.log('Redis not available, using in-memory cache');
            useMemoryCache = true;
            return null; // Stop retrying
          }
          return Math.min(times * 100, 1000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

  // Test connection
  await redis.connect().catch(() => {
    console.log('Redis not available, using in-memory cache fallback');
    useMemoryCache = true;
    redis = null;
  });

} catch (error) {
  console.log('Redis not configured, using in-memory cache');
  useMemoryCache = true;
  redis = null;
}

if (redis) {
  redis.on('connect', () => {
    console.log('Redis connected');
    useMemoryCache = false;
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
    useMemoryCache = true;
  });
}

export const cacheService = {
  // Get cached data with TTL check
  async get(key) {
    try {
      if (useMemoryCache || !redis) {
        const item = memoryCache.get(key);
        if (!item) return null;

        // Check if expired
        if (Date.now() > item.expiresAt) {
          memoryCache.delete(key);
          return null;
        }
        return { data: item.data, cachedAt: item.cachedAt };
      }

      const data = await redis.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      // Fallback to memory cache on error
      const item = memoryCache.get(key);
      if (item && Date.now() <= item.expiresAt) {
        return { data: item.data, cachedAt: item.cachedAt };
      }
      return null;
    }
  },

  // Set cache with TTL (default: 1 hour)
  async set(key, value, ttlSeconds = 3600) {
    try {
      const cacheData = {
        data: value,
        cachedAt: Date.now(),
        expiresAt: Date.now() + (ttlSeconds * 1000)
      };

      // Always set in memory cache as backup
      memoryCache.set(key, cacheData);

      if (!useMemoryCache && redis) {
        await redis.setex(key, ttlSeconds, JSON.stringify({
          data: value,
          cachedAt: Date.now()
        }));
      }
      return true;
    } catch (error) {
      // Memory cache is already set, so return true
      return true;
    }
  },

  // Delete cache
  async del(key) {
    try {
      memoryCache.delete(key);
      if (!useMemoryCache && redis) {
        await redis.del(key);
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if cache exists
  async exists(key) {
    try {
      const item = memoryCache.get(key);
      if (item && Date.now() <= item.expiresAt) return true;

      if (!useMemoryCache && redis) {
        const exists = await redis.exists(key);
        return exists === 1;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Get cache age in seconds
  async getAge(key) {
    try {
      const ttl = await redis.ttl(key);
      return 3600 - ttl; // Approximate age
    } catch (error) {
      return null;
    }
  }
};

export default cacheService;
