// Background Job Schedulers with Bull Queue
// Production-ready job processing for data retention, reminders, and escalation
// Falls back to direct execution when Bull/Redis unavailable

import cron from 'node-cron'
import {
    dataRetentionQueue,
    reminderQueue,
    escalationQueue,
    emailQueue,
    smsQueue,
    isQueuesEnabled,
} from '../config/queue.js'
import { UserModel, ClaimModel, ItemModel, ArchivedClaimModel, DraftSubmissionModel } from '../models/index.js'
import { sendNotificationEmail } from './emailService.js'
import { sendSms } from './smsService.js'

// ============ JOB PROCESSOR FUNCTIONS ============

async function processArchiveClaims(olderThanDays = 365): Promise<{ archivedCount: number }> {
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
}

async function processCleanupVisitors(): Promise<{ deletedCount: number }> {
    const result = await UserModel.deleteMany({
        role: 'visitor',
        'visitorMetadata.expiresAt': { $lt: new Date() },
    })
    return { deletedCount: result.deletedCount ?? 0 }
}

async function processCleanupDrafts(olderThanDays = 30): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    const result = await DraftSubmissionModel.deleteMany({
        updatedAt: { $lt: cutoffDate },
    })
    return { deletedCount: result.deletedCount ?? 0 }
}

async function processAdminPendingReminders(): Promise<{ sentCount: number }> {
    const pendingClaimsCount = await ClaimModel.countDocuments({ status: 'pending' })
    if (pendingClaimsCount === 0) {
        return { sentCount: 0 }
    }

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

    return { sentCount }
}

async function processItemReminder(itemId: string, userId: string): Promise<{ sent: boolean }> {
    const item = await ItemModel.findById(itemId)
    const user = await UserModel.findById(userId)

    const userEmail = user?.profile?.email as string | undefined
    if (!item || !userEmail) {
        return { sent: false }
    }

    await sendNotificationEmail(
        userEmail,
        'Reminder: Item Awaiting Pickup',
        `Your claimed item (${item.trackingId}) is ready for pickup. Please visit the Lost and Found office to collect it.`
    )

    return { sent: true }
}

async function processEscalateOverdueClaims(daysOverdue = 7): Promise<{ escalatedCount: number }> {
    const overdueDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000)

    const overdueClaims = await ClaimModel.find({
        status: 'pending',
        createdAt: { $lt: overdueDate },
        'escalation.isEscalated': { $ne: true },
    })

    let escalatedCount = 0
    for (const claim of overdueClaims) {
        await ClaimModel.updateOne(
            { _id: claim._id },
            {
                $set: {
                    'escalation.isEscalated': true,
                    'escalation.escalatedAt': new Date(),
                    'escalation.reason': `Pending for more than ${daysOverdue} days`,
                },
            }
        )
        escalatedCount++
    }

    if (escalatedCount > 0) {
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
    }

    return { escalatedCount }
}

// ============ SETUP BULL PROCESSORS (only if Redis available) ============

function setupBullProcessors(): void {
    if (!isQueuesEnabled()) {
        console.log('⏭️ Bull processors not set up (no Redis)')
        return
    }

    // Data Retention Queue
    if (dataRetentionQueue) {
        dataRetentionQueue.process('archive-claims', async (job) => {
            return processArchiveClaims(job.data?.olderThanDays)
        })

        dataRetentionQueue.process('cleanup-visitors', async () => {
            return processCleanupVisitors()
        })

        dataRetentionQueue.process('cleanup-drafts', async (job) => {
            return processCleanupDrafts(job.data?.olderThanDays)
        })
    }

    // Reminder Queue
    if (reminderQueue) {
        reminderQueue.process('admin-pending-claims', async () => {
            return processAdminPendingReminders()
        })

        reminderQueue.process('pending-item-reminder', async (job) => {
            const { itemId, userId } = job.data
            return processItemReminder(itemId, userId)
        })
    }

    // Escalation Queue
    if (escalationQueue) {
        escalationQueue.process('overdue-claims', async (job) => {
            return processEscalateOverdueClaims(job.data?.daysOverdue)
        })
    }

    // Email Queue
    if (emailQueue) {
        emailQueue.process(async (job) => {
            const { to, subject, html, text } = job.data
            const { sendEmail } = await import('./emailService.js')
            return sendEmail({ to, subject, html, text })
        })
    }

    // SMS Queue
    if (smsQueue) {
        smsQueue.process(async (job) => {
            const { to, message } = job.data
            return sendSms(to, message)
        })
    }

    console.log('✅ Bull job processors configured')
}

// ============ CRON SCHEDULERS ============

export function initAllSchedulers(): void {
    // Setup Bull processors if available
    setupBullProcessors()

    // Daily at midnight: Data retention jobs
    cron.schedule('0 0 * * *', async () => {
        console.log('📅 Running daily data retention jobs')

        if (isQueuesEnabled() && dataRetentionQueue) {
            dataRetentionQueue.add('archive-claims', { olderThanDays: 365 })
            dataRetentionQueue.add('cleanup-visitors', {})
            dataRetentionQueue.add('cleanup-drafts', { olderThanDays: 30 })
        } else {
            // Direct execution fallback
            try {
                const archiveResult = await processArchiveClaims()
                console.log(`  📦 Archived ${archiveResult.archivedCount} claims`)
                const visitorResult = await processCleanupVisitors()
                console.log(`  👤 Cleaned up ${visitorResult.deletedCount} expired visitors`)
                const draftResult = await processCleanupDrafts()
                console.log(`  📝 Cleaned up ${draftResult.deletedCount} old drafts`)
            } catch (error) {
                console.error('Data retention job failed:', error)
            }
        }
    })

    // Daily at 9 AM: Reminder jobs
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily reminder jobs')

        if (isQueuesEnabled() && reminderQueue) {
            reminderQueue.add('admin-pending-claims', {})
        } else {
            try {
                const result = await processAdminPendingReminders()
                console.log(`  📧 Sent ${result.sentCount} admin reminders`)
            } catch (error) {
                console.error('Reminder job failed:', error)
            }
        }
    })

    // Daily at 10 AM: Escalate overdue claims
    cron.schedule('0 10 * * *', async () => {
        console.log('⬆️ Running escalation jobs')

        if (isQueuesEnabled() && escalationQueue) {
            escalationQueue.add('overdue-claims', { daysOverdue: 7 })
        } else {
            try {
                const result = await processEscalateOverdueClaims()
                console.log(`  ⚠️ Escalated ${result.escalatedCount} claims`)
            } catch (error) {
                console.error('Escalation job failed:', error)
            }
        }
    })

    console.log('✅ All background schedulers initialized')
}

// ============ MANUAL JOB TRIGGERS ============

export async function triggerDataRetention(): Promise<string> {
    if (isQueuesEnabled() && dataRetentionQueue) {
        const job = await dataRetentionQueue.add('archive-claims', { olderThanDays: 365 })
        return `Job queued: ${job.id}`
    } else {
        const result = await processArchiveClaims()
        return `Direct execution: archived ${result.archivedCount} claims`
    }
}

export async function triggerReminderJobs(): Promise<string> {
    if (isQueuesEnabled() && reminderQueue) {
        const job = await reminderQueue.add('admin-pending-claims', {})
        return `Job queued: ${job.id}`
    } else {
        const result = await processAdminPendingReminders()
        return `Direct execution: sent ${result.sentCount} reminders`
    }
}

export async function triggerEscalation(): Promise<string> {
    if (isQueuesEnabled() && escalationQueue) {
        const job = await escalationQueue.add('overdue-claims', { daysOverdue: 7 })
        return `Job queued: ${job.id}`
    } else {
        const result = await processEscalateOverdueClaims()
        return `Direct execution: escalated ${result.escalatedCount} claims`
    }
}

// ============ QUEUE HELPER FUNCTIONS ============

export async function queueEmail(
    to: string,
    subject: string,
    html?: string,
    text?: string
): Promise<string> {
    if (isQueuesEnabled() && emailQueue) {
        const job = await emailQueue.add({ to, subject, html, text })
        return job.id?.toString() ?? 'unknown'
    } else {
        // Direct send fallback
        const { sendEmail } = await import('./emailService.js')
        await sendEmail({ to, subject, html, text })
        return 'direct-send'
    }
}

export async function queueSms(to: string, message: string): Promise<string> {
    if (isQueuesEnabled() && smsQueue) {
        const job = await smsQueue.add({ to, message })
        return job.id?.toString() ?? 'unknown'
    } else {
        // Direct send fallback
        await sendSms(to, message)
        return 'direct-send'
    }
}

export async function queueItemReminder(itemId: string, userId: string): Promise<string> {
    if (isQueuesEnabled() && reminderQueue) {
        const job = await reminderQueue.add('pending-item-reminder', { itemId, userId })
        return job.id?.toString() ?? 'unknown'
    } else {
        await processItemReminder(itemId, userId)
        return 'direct-send'
    }
}

// ============ LEGACY EXPORTS (for backward compatibility) ============

export const initDataRetentionScheduler = (): void => {
    console.log('📅 Data Retention Scheduler initialized')
}

export const initReminderScheduler = (): void => {
    console.log('⏰ Reminder Scheduler initialized')
}

export const initEscalationScheduler = (): void => {
    console.log('⬆️ Escalation Scheduler initialized')
}
