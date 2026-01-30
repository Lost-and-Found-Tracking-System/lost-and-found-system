// Background Job Schedulers with Bull Queue
// Production-ready job processing for data retention, reminders, and escalation

import cron from 'node-cron'
import { Types } from 'mongoose'
import {
    dataRetentionQueue,
    reminderQueue,
    escalationQueue,
    emailQueue,
    smsQueue,
    setupQueueListeners,
} from '../config/queue.js'
import { UserModel, ClaimModel, ItemModel, ArchivedClaimModel, DraftSubmissionModel } from '../models/index.js'
import { sendNotificationEmail } from './emailService.js'

// ============ JOB PROCESSORS ============

/**
 * Process data retention jobs
 */
dataRetentionQueue.process('archive-claims', async (job) => {
    const { olderThanDays = 365 } = job.data
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const claimsToArchive = await ClaimModel.find({
        status: 'resolved',
        updatedAt: { $lt: cutoffDate },
    }).limit(100)

    let archivedCount = 0
    for (const claim of claimsToArchive) {
        await ArchivedClaimModel.create({
            originalId: claim._id,
            ...claim.toObject(),
            archivedAt: new Date(),
        })
        await ClaimModel.deleteOne({ _id: claim._id })
        archivedCount++
    }

    return { archivedCount }
})

dataRetentionQueue.process('cleanup-visitors', async (_job) => {
    const result = await UserModel.deleteMany({
        role: 'visitor',
        'visitorMetadata.expiresAt': { $lt: new Date() },
    })

    return { deletedCount: result.deletedCount }
})

dataRetentionQueue.process('cleanup-drafts', async (job) => {
    const { olderThanDays = 30 } = job.data
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

    const result = await DraftSubmissionModel.deleteMany({
        updatedAt: { $lt: cutoffDate },
    })

    return { deletedCount: result.deletedCount }
})

/**
 * Process reminder jobs
 */
reminderQueue.process('pending-item-reminder', async (job) => {
    const { itemId, userId } = job.data

    const item = await ItemModel.findById(itemId)
    const user = await UserModel.findById(userId)

    const userEmail = user?.profile?.email as string | undefined
    if (!item || !userEmail) {
        return { skipped: true }
    }

    await sendNotificationEmail(
        userEmail,
        'Reminder: Item Awaiting Pickup',
        `Your claimed item (${item.trackingId}) is ready for pickup. Please visit the Lost and Found office to collect it.`
    )

    return { sent: true }
})

reminderQueue.process('admin-pending-claims', async (_job) => {
    const pendingClaimsCount = await ClaimModel.countDocuments({ status: 'pending' })

    if (pendingClaimsCount === 0) {
        return { skipped: true, reason: 'No pending claims' }
    }

    // Get admin users
    const admins = await UserModel.find({ role: { $in: ['admin', 'delegated_admin'] } })

    let sentCount = 0
    for (const admin of admins) {
        const adminEmail = admin.profile?.email as string | undefined
        if (adminEmail) {
            await sendNotificationEmail(
                adminEmail,
                'Pending Claims Review Required',
                `There are ${pendingClaimsCount} claims awaiting review. Please log in to process them.`
            )
            sentCount++
        }
    }

    return { pendingClaimsCount, adminNotificationsSent: sentCount }
})

/**
 * Process escalation jobs
 */
escalationQueue.process('escalate-overdue-claims', async (job) => {
    const { daysOverdue = 7 } = job.data
    const cutoffDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000)

    const overdueClaims = await ClaimModel.find({
        status: 'pending',
        createdAt: { $lt: cutoffDate },
        escalated: { $ne: true },
    })

    let escalatedCount = 0
    for (const claim of overdueClaims) {
        await ClaimModel.updateOne(
            { _id: claim._id },
            { $set: { escalated: true, escalatedAt: new Date() } }
        )
        escalatedCount++
    }

    // Notify senior admins
    const seniorAdmins = await UserModel.find({ role: 'admin' })
    for (const admin of seniorAdmins) {
        const adminEmail = admin.profile?.email as string | undefined
        if (adminEmail) {
            await sendNotificationEmail(
                adminEmail,
                `⚠️ ${escalatedCount} Claims Escalated`,
                `${escalatedCount} claims have been pending for more than ${daysOverdue} days and require immediate attention.`
            )
        }
    }

    return { escalatedCount }
})

/**
 * Process email queue
 */
emailQueue.process(async (job) => {
    const { to, subject, html, text } = job.data
    const { sendEmail } = await import('./emailService.js')
    return sendEmail({ to, subject, html, text })
})

/**
 * Process SMS queue
 */
smsQueue.process(async (job) => {
    const { to, message } = job.data
    const { sendSms } = await import('./smsService.js')
    return sendSms(to, message)
})

// ============ SCHEDULER INITIALIZATION ============

/**
 * Initialize all schedulers with cron jobs
 */
export function initAllSchedulers(): void {
    setupQueueListeners()

    // Daily at midnight: Archive old claims
    cron.schedule('0 0 * * *', () => {
        console.log('📅 Running daily data retention jobs')
        dataRetentionQueue.add('archive-claims', { olderThanDays: 365 })
        dataRetentionQueue.add('cleanup-visitors', 'cleanup-visitors-job')
        dataRetentionQueue.add('cleanup-drafts', { olderThanDays: 30 })
    })

    // Daily at 9 AM: Send admin reminders
    cron.schedule('0 9 * * *', () => {
        console.log('⏰ Running daily reminder jobs')
        reminderQueue.add('admin-pending-claims', 'admin-pending-claims-job')
    })

    // Daily at 10 AM: Escalate overdue claims
    cron.schedule('0 10 * * *', () => {
        console.log('⬆️ Running escalation jobs')
        escalationQueue.add('escalate-overdue-claims', { daysOverdue: 7 })
    })

    console.log('✅ All background schedulers initialized with Bull queue')
}

// ============ MANUAL JOB TRIGGERS ============

/**
 * Manually trigger archive of old claims
 */
export async function triggerArchiveOldClaims(olderThanDays = 365): Promise<string> {
    const job = await dataRetentionQueue.add('archive-claims', { olderThanDays })
    return job.id?.toString() ?? 'unknown'
}

/**
 * Manually trigger visitor cleanup
 */
export async function triggerCleanupVisitors(): Promise<string> {
    const job = await dataRetentionQueue.add('cleanup-visitors', {})
    return job.id?.toString() ?? 'unknown'
}

/**
 * Queue a pending item reminder
 */
export async function queueItemReminder(itemId: string, userId: string): Promise<string> {
    const job = await reminderQueue.add('pending-item-reminder', { itemId, userId })
    return job.id?.toString() ?? 'unknown'
}

/**
 * Queue an email for sending
 */
export async function queueEmail(
    to: string,
    subject: string,
    html?: string,
    text?: string
): Promise<string> {
    const job = await emailQueue.add({ to, subject, html, text })
    return job.id?.toString() ?? 'unknown'
}

/**
 * Queue an SMS for sending
 */
export async function queueSms(to: string, message: string): Promise<string> {
    const job = await smsQueue.add({ to, message })
    return job.id?.toString() ?? 'unknown'
}

// ============ LEGACY EXPORTS (for backward compatibility) ============

export const initDataRetentionScheduler = (): void => {
    console.log('📅 Data Retention Scheduler initialized with Bull queue')
}

export const initReminderScheduler = (): void => {
    console.log('⏰ Reminder Scheduler initialized with Bull queue')
}

export const initEscalationScheduler = (): void => {
    console.log('⬆️ Escalation Scheduler initialized with Bull queue')
}

export async function archiveOldClaims(): Promise<number> {
    await triggerArchiveOldClaims()
    return 0 // Returns immediately, actual count in job result
}

export async function cleanupExpiredVisitors(): Promise<number> {
    await triggerCleanupVisitors()
    return 0
}

export async function cleanupOldDrafts(): Promise<number> {
    const job = await dataRetentionQueue.add('cleanup-drafts', { olderThanDays: 30 })
    return 0
}

export async function sendPendingItemReminders(): Promise<number> {
    await reminderQueue.add('admin-pending-claims', {})
    return 0
}
