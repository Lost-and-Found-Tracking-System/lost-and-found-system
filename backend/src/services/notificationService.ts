// Notification Service
// Handles creating and dispatching notifications

import { NotificationModel, NotificationPreferencesModel, UserModel } from '../models/index.js'
import { Types } from 'mongoose'

export type NotificationType =
    | 'item_match_found'
    | 'claim_submitted'
    | 'claim_approved'
    | 'claim_rejected'
    | 'item_claimed'
    | 'handover_scheduled'
    | 'reminder'
    | 'system_announcement'
    | 'security_alert'

export interface NotificationPayload {
    userId: string
    type: NotificationType
    title: string
    message: string
    data?: Record<string, unknown>
    priority?: 'low' | 'normal' | 'high' | 'urgent'
}

/**
 * Create and dispatch a notification
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
        // Check user preferences
        const prefs = await NotificationPreferencesModel.findOne({
            userId: new Types.ObjectId(payload.userId),
        })

        // Create in-app notification
        await NotificationModel.create({
            userId: new Types.ObjectId(payload.userId),
            type: payload.type,
            title: payload.title,
            message: payload.message,
            data: payload.data,
            priority: payload.priority || 'normal',
            isRead: false,
            createdAt: new Date(),
        })

        // Check if email notifications are enabled
        if (prefs?.emailEnabled ?? true) {
            // Check type-specific preferences
            const shouldSendEmail =
                (payload.type.includes('item') && prefs?.itemUpdates !== false) ||
                (payload.type.includes('claim') && prefs?.claimUpdates !== false) ||
                (payload.type === 'system_announcement' && prefs?.systemAnnouncements !== false) ||
                (payload.type === 'security_alert') // Always send security alerts

            if (shouldSendEmail) {
                // Queue email dispatch
                await queueEmailNotification(payload.userId, payload.title, payload.message)
            }
        }

        return true
    } catch (error) {
        console.error('Failed to send notification:', error)
        return false
    }
}

/**
 * Send notifications to multiple users
 */
export async function sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
): Promise<number> {
    let successCount = 0

    for (const userId of userIds) {
        const success = await sendNotification({
            userId,
            type,
            title,
            message,
            data,
        })
        if (success) successCount++
    }

    return successCount
}

/**
 * Queue email notification (placeholder)
 * In production, integrate with email service (SendGrid, SES, etc.)
 */
async function queueEmailNotification(userId: string, subject: string, body: string): Promise<void> {
    // Get user email
    const user = await UserModel.findById(userId).select('profile.email')
    if (!user?.profile?.email) {
        console.warn(`No email found for user ${userId}`)
        return
    }

    // Placeholder - log email that would be sent
    console.log(`📧 EMAIL QUEUED:`)
    console.log(`   To: ${user.profile.email}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body: ${body.substring(0, 100)}...`)

    // In production:
    // await emailQueue.add({ to: user.profile.email, subject, body })
}

/**
 * Send item match notification
 */
export async function notifyItemMatch(
    lostItemOwnerId: string,
    foundItemTrackingId: string,
    matchConfidence: number
): Promise<void> {
    await sendNotification({
        userId: lostItemOwnerId,
        type: 'item_match_found',
        title: 'Potential Match Found!',
        message: `We found a potential match for your lost item (${Math.round(matchConfidence * 100)}% confidence). Check it out!`,
        data: { foundItemTrackingId, matchConfidence },
        priority: 'high',
    })
}

/**
 * Send claim status notification
 */
export async function notifyClaimStatus(
    userId: string,
    itemTrackingId: string,
    status: 'approved' | 'rejected',
    notes?: string
): Promise<void> {
    const title = status === 'approved'
        ? 'Claim Approved! 🎉'
        : 'Claim Update'

    const message = status === 'approved'
        ? `Your claim for item ${itemTrackingId} has been approved! Please visit the Lost and Found office to collect your item.`
        : `Your claim for item ${itemTrackingId} was not approved. ${notes || 'Please contact the Lost and Found office for more information.'}`

    await sendNotification({
        userId,
        type: status === 'approved' ? 'claim_approved' : 'claim_rejected',
        title,
        message,
        data: { itemTrackingId, notes },
        priority: status === 'approved' ? 'high' : 'normal',
    })
}

/**
 * Send security alert (failed login attempts, etc.)
 */
export async function sendSecurityAlert(
    userId: string,
    alertType: string,
    details: string
): Promise<void> {
    await sendNotification({
        userId,
        type: 'security_alert',
        title: '⚠️ Security Alert',
        message: details,
        data: { alertType },
        priority: 'urgent',
    })
}
