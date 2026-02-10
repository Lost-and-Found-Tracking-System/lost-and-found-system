/**
 * @module config/redis
 * @description Redis connection manager with automatic in-memory fallback.
 * Provides OTP storage, rate limiting, and key-value caching.
 * In production, uses Redis; in development or when Redis is unavailable,
 * transparently falls back to an in-memory Map store.
 */

import { Redis } from 'ioredis'
import { env } from './env.js'

/**
 * In-memory fallback storage for when Redis is unavailable.
 * Each entry has a value and an expiration timestamp.
 */
const memoryStore = new Map<string, { value: string; expiresAt: number }>()

/** @internal Singleton Redis client instance */
let redisClient: Redis | null = null
/** @internal Flag indicating whether the in-memory fallback is active */
let useMemoryFallback = false

/**
 * Removes expired entries from the in-memory fallback store.
 * Runs automatically every 60 seconds.
 * @internal
 */
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

/**
 * Returns the Redis client instance, creating one if necessary.
 * If Redis is unavailable, returns `null` and activates the in-memory fallback.
 *
 * @returns The Redis client, or `null` if using memory fallback
 */
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

/**
 * Closes the Redis connection gracefully.
 */
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

/**
 * Checks whether the system is using the in-memory fallback instead of Redis.
 * @returns `true` if Redis is unavailable and the in-memory store is active
 */
export function isUsingMemoryFallback(): boolean {
    return useMemoryFallback
}

// ─── OTP Storage Helpers ───────────────────────────────────────────────

/** @internal Key prefix for OTP entries */
const OTP_PREFIX = 'otp:'
/** @internal Key prefix for rate limiting entries */
const RATE_LIMIT_PREFIX = 'rate:'

/**
 * Stores a one-time password (OTP) with a time-to-live.
 * Uses Redis if available, otherwise falls back to in-memory storage.
 *
 * @param identifier - The user identifier (email or phone number)
 * @param purpose - The OTP purpose (e.g., `'password-reset'`, `'visitor-verify'`)
 * @param otp - The generated OTP string
 * @param ttlSeconds - Time-to-live in seconds (e.g., `600` for 10 minutes)
 */
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

/**
 * Retrieves a stored OTP for the given identifier and purpose.
 *
 * @param identifier - The user identifier (email or phone number)
 * @param purpose - The OTP purpose
 * @returns The OTP string, or `null` if not found or expired
 */
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

/**
 * Deletes a stored OTP after successful verification.
 *
 * @param identifier - The user identifier (email or phone number)
 * @param purpose - The OTP purpose
 */
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

// ─── Rate Limiting Helpers ─────────────────────────────────────────────

/**
 * Checks and increments a rate limit counter for the given identifier.
 * Used to prevent brute-force attacks on OTP and login endpoints.
 *
 * @param identifier - The rate limit key (e.g., `'otp:user@email.com'`)
 * @param maxAttempts - Maximum allowed attempts within the window
 * @param windowSeconds - Sliding window duration in seconds
 * @returns Object with `allowed` (whether the request should proceed) and `remaining` attempts
 */
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

/**
 * Resets the rate limit counter for a given identifier.
 * Typically called after a successful authentication.
 *
 * @param identifier - The rate limit key to reset
 */
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
