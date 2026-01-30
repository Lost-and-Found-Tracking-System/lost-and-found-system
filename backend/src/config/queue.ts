// Bull Queue Configuration
// Production-ready job queue for background tasks (requires Redis)

import Bull from 'bull'
import { env } from './env.js'
import { isUsingMemoryFallback } from './redis.js'

let queuesEnabled = false

// Create queue factory that returns null if Redis unavailable
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

// Queue instances (may be null if Redis unavailable)
export const dataRetentionQueue = createQueue('data-retention')
export const reminderQueue = createQueue('reminders', {
    defaultJobOptions: { backoff: { type: 'exponential', delay: 30000 } },
})
export const escalationQueue = createQueue('escalation')
export const emailQueue = createQueue('emails', {
    defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 10000 } },
})
export const smsQueue = createQueue('sms', {
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 15000 } },
})

export function isQueuesEnabled(): boolean {
    return queuesEnabled && !isUsingMemoryFallback()
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
    if (!isQueuesEnabled()) return

    const queues = [dataRetentionQueue, reminderQueue, escalationQueue, emailQueue, smsQueue]
    await Promise.all(queues.filter(Boolean).map((q) => q!.close()))
    console.log('All Bull queues closed')
}

// Queue event logging
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

// Get queue stats
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
