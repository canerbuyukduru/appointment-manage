import Redis from 'ioredis'
import logger from './logger'

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on('error', (err) => logger.error('Redis hatası:', err))
redis.on('connect', () => logger.info('Redis bağlandı'))

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  return value ? JSON.parse(value) : null
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function deleteCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}
