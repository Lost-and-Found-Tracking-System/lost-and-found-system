// Redis Configuration
// Production-ready Redis client for OTP storage, rate limiting, and caching

import { Redis } from 'ioredis'
import { env } from './env.js'

// Use Redis class instance
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(env.redis.url, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        })

        redisClient.on('connect', () => {
            console.log('🔴 Redis connected')
        })

        redisClient.on('error', (err: Error) => {
            console.error('Redis error:', err)
        })
    }

    return redisClient
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
        console.log('Redis connection closed')
    }
}

// OTP Storage helpers
const OTP_PREFIX = 'otp:'
const RATE_LIMIT_PREFIX = 'rate:'

export async function storeOtp(
    identifier: string,
    purpose: string,
    otp: string,
    ttlSeconds: number
): Promise<void> {
    const redis = getRedisClient()
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    await redis.setex(key, ttlSeconds, otp)
}

export async function getStoredOtp(
    identifier: string,
    purpose: string
): Promise<string | null> {
    const redis = getRedisClient()
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    return redis.get(key)
}

export async function deleteOtp(identifier: string, purpose: string): Promise<void> {
    const redis = getRedisClient()
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    await redis.del(key)
}

// Rate limiting helpers
export async function checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const redis = getRedisClient()
    const key = `${RATE_LIMIT_PREFIX}${identifier}`

    const current = await redis.incr(key)

    if (current === 1) {
        await redis.expire(key, windowSeconds)
    }

    const remaining = Math.max(0, maxAttempts - current)

    return {
        allowed: current <= maxAttempts,
        remaining,
    }
}

export async function resetRateLimit(identifier: string): Promise<void> {
    const redis = getRedisClient()
    const key = `${RATE_LIMIT_PREFIX}${identifier}`
    await redis.del(key)
}
