/**
 * @module config/queue
 * @description Bull queue configuration for background job processing.
 * Creates Redis-backed job queues for email, SMS, data retention, reminders, and escalation.
 * Queues are disabled when Redis is unavailable.
 */

import Bull from 'bull'
import { env } from './env.js'
import { isUsingMemoryFallback } from './redis.js'

/** @internal Tracks whether any queue was successfully created */
let queuesEnabled = false

/**
 * Factory function to create a Bull queue instance.
 * Returns `null` if Redis is unavailable (memory fallback mode).
 *
 * @param name - The queue name identifier
 * @param options - Optional Bull queue configuration overrides
 * @returns A Bull queue instance, or `null` if Redis is unavailable
 * @internal
 */
function createQueue(name: string, options?: Bull.QueueOptions): Bull.Queue | null {
    if (isUsingMemoryFallback()) {
        return null
    }

    try {
        queuesEnabled = true
        return new Bull(name, env.redis.url, {
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 60000,
                },
                ...options?.defaultJobOptions,
            },
        })
    } catch {
        console.warn(`⚠️ Failed to create queue: ${name}`)
        return null
    }
}

// ─── Queue Instances ───────────────────────────────────────────────────

/** Queue for automated data retention and archival tasks */
export const dataRetentionQueue = createQueue('data-retention')

/** Queue for user reminder notifications (e.g., unclaimed items) */
export const reminderQueue = createQueue('reminders', {
    defaultJobOptions: { backoff: { type: 'exponential', delay: 30000 } },
})

/** Queue for claim conflict escalation tasks */
export const escalationQueue = createQueue('escalation')

/** Queue for outbound email delivery via SendGrid (5 retries) */
export const emailQueue = createQueue('emails', {
    defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 10000 } },
})

/** Queue for outbound SMS delivery via Fast2SMS (3 retries) */
export const smsQueue = createQueue('sms', {
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 15000 } },
})

/**
 * Checks whether Bull queues are operational.
 * @returns `true` if queues were created and Redis is available
 */
export function isQueuesEnabled(): boolean {
    return queuesEnabled && !isUsingMemoryFallback()
}

/**
 * Gracefully closes all Bull queue connections.
 * Called during server shutdown.
 */
export async function closeQueues(): Promise<void> {
    if (!isQueuesEnabled()) return

    const queues = [dataRetentionQueue, reminderQueue, escalationQueue, emailQueue, smsQueue]
    await Promise.all(queues.filter(Boolean).map((q) => q!.close()))
    console.log('All Bull queues closed')
}

/**
 * Attaches event listeners (completed, failed, stalled) to all active queues.
 * Provides console logging for job lifecycle events.
 */
export function setupQueueListeners(): void {
    if (!isQueuesEnabled()) return

    const queues = [
        { name: 'data-retention', queue: dataRetentionQueue },
        { name: 'reminders', queue: reminderQueue },
        { name: 'escalation', queue: escalationQueue },
        { name: 'emails', queue: emailQueue },
        { name: 'sms', queue: smsQueue },
    ]

    queues.forEach(({ name, queue }) => {
        if (!queue) return

        queue.on('completed', (job) => {
            console.log(`✅ [${name}] Job ${job.id} completed`)
        })

        queue.on('failed', (job, err) => {
            console.error(`❌ [${name}] Job ${job.id} failed:`, err.message)
        })

        queue.on('stalled', (job) => {
            console.warn(`⚠️ [${name}] Job ${job.id} stalled`)
        })
    })
}

/**
 * Retrieves current job count statistics for all queues.
 *
 * @returns An object mapping queue names to their job counts (waiting, active, completed, failed).
 *          Returns an empty object if queues are disabled.
 */
export async function getQueueStats(): Promise<Record<string, {
    waiting: number
    active: number
    completed: number
    failed: number
}>> {
    const stats: Record<string, {
        waiting: number
        active: number
        completed: number
        failed: number
    }> = {}

    if (!isQueuesEnabled()) {
        return stats
    }

    const queues = [
        { name: 'data-retention', queue: dataRetentionQueue },
        { name: 'reminders', queue: reminderQueue },
        { name: 'escalation', queue: escalationQueue },
        { name: 'emails', queue: emailQueue },
        { name: 'sms', queue: smsQueue },
    ]

    for (const { name, queue } of queues) {
        if (!queue) continue
        const counts = await queue.getJobCounts()
        stats[name] = {
            waiting: counts.waiting,
            active: counts.active,
            completed: counts.completed,
            failed: counts.failed,
        }
    }

    return stats
}
