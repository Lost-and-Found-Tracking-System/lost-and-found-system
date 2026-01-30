// Notification Service
// Production-ready notification handling with email dispatch

import { NotificationModel, NotificationPreferencesModel, UserModel } from '../models/index.js'
import { Types } from 'mongoose'
import { sendNotificationEmail, sendSecurityAlertEmail } from './emailService.js'
import { sendClaimStatusSms, sendSecurityAlertSms } from './smsService.js'
import { queueEmail, queueSms } from './schedulers.js'

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

        // Get user details for email/SMS
        const user = await UserModel.findById(payload.userId).select('profile')
        if (!user?.profile) {
            return true // In-app notification created, but can't send email/SMS
        }

        const userEmail = user.profile.email as string | undefined
        const userPhone = user.profile.phone as string | undefined

        // Check if email notifications are enabled
        const emailEnabled = prefs?.emailEnabled ?? true
        const smsEnabled = prefs?.smsEnabled ?? false

        // Determine if we should send email based on notification type
        const shouldSendEmail =
            emailEnabled &&
            ((payload.type.includes('item') && prefs?.itemUpdates !== false) ||
                (payload.type.includes('claim') && prefs?.claimUpdates !== false) ||
                (payload.type === 'system_announcement' && prefs?.systemAnnouncements !== false) ||
                payload.type === 'security_alert') // Always notify security alerts

        if (shouldSendEmail && userEmail) {
            // Queue email for sending
            await queueEmail(userEmail, payload.title, `<p>${payload.message}</p>`)
        }

        // Send SMS for high-priority notifications
        const shouldSendSms =
            smsEnabled &&
            userPhone &&
            (payload.priority === 'high' || payload.priority === 'urgent' || payload.type === 'security_alert')

        if (shouldSendSms && userPhone) {
            await queueSms(userPhone, payload.message)
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
    const title =
        status === 'approved' ? 'Claim Approved! 🎉' : 'Claim Update'

    const message =
        status === 'approved'
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

    // Also send SMS for claim approval
    if (status === 'approved') {
        const user = await UserModel.findById(userId).select('profile.phone')
        const userPhone = user?.profile?.phone as string | undefined
        if (userPhone) {
            await sendClaimStatusSms(userPhone, itemTrackingId, status)
        }
    }
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

    // Send direct email and SMS for security alerts
    const user = await UserModel.findById(userId).select('profile')
    const userEmail = user?.profile?.email as string | undefined
    const userPhone = user?.profile?.phone as string | undefined

    if (userEmail) {
        await sendSecurityAlertEmail(userEmail, alertType, details)
    }
    if (userPhone) {
        await sendSecurityAlertSms(userPhone, alertType)
    }
}

/**
 * Send system-wide announcement
 */
export async function sendSystemAnnouncement(
    title: string,
    message: string,
    targetRoles?: string[],
    targetLocation?: string
): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { status: 'active' }

    if (targetRoles && targetRoles.length > 0) {
        query.role = { $in: targetRoles }
    }

    const users = await UserModel.find(query).select('_id')
    const userIds = users.map((u) => u._id.toString())

    return sendBulkNotification(
        userIds,
        'system_announcement',
        title,
        message,
        { targetRoles, targetLocation }
    )
}
