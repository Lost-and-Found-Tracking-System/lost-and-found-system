// Bull Queue Configuration
// Production-ready job queue for background tasks

import Bull from 'bull'
import { env } from './env.js'

// Queue instances
export const dataRetentionQueue = new Bull('data-retention', env.redis.url, {
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 60000, // 1 minute
        },
    },
})

export const reminderQueue = new Bull('reminders', env.redis.url, {
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 30000,
        },
    },
})

export const escalationQueue = new Bull('escalation', env.redis.url, {
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 60000,
        },
    },
})

export const emailQueue = new Bull('emails', env.redis.url, {
    defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
    },
})

export const smsQueue = new Bull('sms', env.redis.url, {
    defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 15000,
        },
    },
})

// Graceful shutdown
export async function closeQueues(): Promise<void> {
    await Promise.all([
        dataRetentionQueue.close(),
        reminderQueue.close(),
        escalationQueue.close(),
        emailQueue.close(),
        smsQueue.close(),
    ])
    console.log('All Bull queues closed')
}

// Queue event logging
const queues = [
    { name: 'data-retention', queue: dataRetentionQueue },
    { name: 'reminders', queue: reminderQueue },
    { name: 'escalation', queue: escalationQueue },
    { name: 'emails', queue: emailQueue },
    { name: 'sms', queue: smsQueue },
]

export function setupQueueListeners(): void {
    queues.forEach(({ name, queue }) => {
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

    for (const { name, queue } of queues) {
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
