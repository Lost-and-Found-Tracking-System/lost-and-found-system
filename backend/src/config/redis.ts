// Redis Configuration with In-Memory Fallback
// Production uses Redis; development can fall back to in-memory storage

import { Redis } from 'ioredis'
import { env } from './env.js'

// In-memory fallback storage
const memoryStore = new Map<string, { value: string; expiresAt: number }>()

let redisClient: Redis | null = null
let useMemoryFallback = false

function cleanupExpiredMemoryEntries(): void {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
        if (entry.expiresAt <= now) {
            memoryStore.delete(key)
        }
    }
}

// Run cleanup every minute
setInterval(cleanupExpiredMemoryEntries, 60000)

export function getRedisClient(): Redis | null {
    if (useMemoryFallback) {
        return null
    }

    if (!redisClient) {
        try {
            redisClient = new Redis(env.redis.url, {
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.warn('⚠️ Redis unavailable, switching to in-memory fallback')
                        useMemoryFallback = true
                        return null // Stop retrying
                    }
                    return Math.min(times * 100, 1000)
                },
            })

            redisClient.on('connect', () => {
                console.log('🔴 Redis connected')
                useMemoryFallback = false
            })

            redisClient.on('error', (err: Error) => {
                if (!useMemoryFallback) {
                    console.warn('⚠️ Redis error, using in-memory fallback:', err.message)
                    useMemoryFallback = true
                }
            })
        } catch (error) {
            console.warn('⚠️ Redis initialization failed, using in-memory fallback')
            useMemoryFallback = true
            return null
        }
    }

    return redisClient
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        try {
            await redisClient.quit()
        } catch {
            // Ignore errors on close
        }
        redisClient = null
        console.log('Redis connection closed')
    }
}

export function isUsingMemoryFallback(): boolean {
    return useMemoryFallback
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
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    const redis = getRedisClient()

    if (redis && !useMemoryFallback) {
        try {
            await redis.setex(key, ttlSeconds, otp)
            return
        } catch {
            useMemoryFallback = true
        }
    }

    // In-memory fallback
    memoryStore.set(key, {
        value: otp,
        expiresAt: Date.now() + ttlSeconds * 1000,
    })
}

export async function getStoredOtp(
    identifier: string,
    purpose: string
): Promise<string | null> {
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    const redis = getRedisClient()

    if (redis && !useMemoryFallback) {
        try {
            return await redis.get(key)
        } catch {
            useMemoryFallback = true
        }
    }

    // In-memory fallback
    const entry = memoryStore.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
        memoryStore.delete(key)
        return null
    }
    return entry.value
}

export async function deleteOtp(identifier: string, purpose: string): Promise<void> {
    const key = `${OTP_PREFIX}${identifier}:${purpose}`
    const redis = getRedisClient()

    if (redis && !useMemoryFallback) {
        try {
            await redis.del(key)
            return
        } catch {
            useMemoryFallback = true
        }
    }

    // In-memory fallback
    memoryStore.delete(key)
}

// Rate limiting helpers
export async function checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const key = `${RATE_LIMIT_PREFIX}${identifier}`
    const redis = getRedisClient()

    if (redis && !useMemoryFallback) {
        try {
            const current = await redis.incr(key)

            if (current === 1) {
                await redis.expire(key, windowSeconds)
            }

            const remaining = Math.max(0, maxAttempts - current)
            return {
                allowed: current <= maxAttempts,
                remaining,
            }
        } catch {
            useMemoryFallback = true
        }
    }

    // In-memory fallback
    const entry = memoryStore.get(key)
    const now = Date.now()
    let current = 1

    if (entry && entry.expiresAt > now) {
        current = parseInt(entry.value, 10) + 1
    }

    memoryStore.set(key, {
        value: current.toString(),
        expiresAt: now + windowSeconds * 1000,
    })

    const remaining = Math.max(0, maxAttempts - current)
    return {
        allowed: current <= maxAttempts,
        remaining,
    }
}

export async function resetRateLimit(identifier: string): Promise<void> {
    const key = `${RATE_LIMIT_PREFIX}${identifier}`
    const redis = getRedisClient()

    if (redis && !useMemoryFallback) {
        try {
            await redis.del(key)
            return
        } catch {
            useMemoryFallback = true
        }
    }

    // In-memory fallback
    memoryStore.delete(key)
}
