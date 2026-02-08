/**
 * INTEGRATION TESTS FOR NOTIFICATION SERVICE
 * Tests with database and mocked email/SMS
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// Mock email and SMS services
vi.mock('../../src/services/emailService.js', () => ({
    sendNotificationEmail: vi.fn().mockResolvedValue(true),
    sendSecurityAlertEmail: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../src/services/smsService.js', () => ({
    sendClaimStatusSms: vi.fn().mockResolvedValue(true),
    sendSecurityAlertSms: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../src/services/schedulers.js', () => ({
    queueEmail: vi.fn().mockResolvedValue(true),
    queueSms: vi.fn().mockResolvedValue(true),
}))

import {
    sendNotification,
    sendBulkNotification,
    notifyItemMatch,
    notifyClaimStatus,
    sendSecurityAlert,
    sendSystemAnnouncement,
} from '../../src/services/notificationService.js'
import { NotificationModel, NotificationPreferencesModel, UserModel } from '../../src/models/index.js'
import { queueEmail, queueSms } from '../../src/services/schedulers.js'

let mongoServer: MongoMemoryServer
let testUserId: string

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())

    // Create test user
    const user = await UserModel.create({
        role: 'student',
        credentials: {
            passwordHash: 'test-hash',
            passwordUpdatedAt: new Date(),
            failedLoginAttempts: 0,
        },
        profile: {
            fullName: 'Notification User',
            email: 'notif@example.com',
            phone: '9876543210',
        },
        status: 'active',
    })
    testUserId = user._id.toString()

    // Create notification preferences
    await NotificationPreferencesModel.create({
        userId: testUserId,
        emailEnabled: true,
        smsEnabled: true,
        itemUpdates: true,
        claimUpdates: true,
        systemAnnouncements: true,
    })
})

beforeEach(async () => {
    await NotificationModel.deleteMany({})
    vi.clearAllMocks()
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe('Notification Service - sendNotification', () => {
    it('should create in-app notification', async () => {
        const result = await sendNotification({
            userId: testUserId,
            type: 'item_match_found',
            title: 'Match Found',
            message: 'We found a match for your item',
        })

        expect(result).toBe(true)

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif).toBeDefined()
        expect(notif?.title).toBe('Match Found')
    })

    it('should queue email notification', async () => {
        await sendNotification({
            userId: testUserId,
            type: 'item_match_found',
            title: 'Match Found',
            message: 'Test message',
        })

        expect(queueEmail).toHaveBeenCalled()
    })

    it('should queue SMS for high priority', async () => {
        await sendNotification({
            userId: testUserId,
            type: 'claim_approved',
            title: 'Claim Approved',
            message: 'Your claim is approved',
            priority: 'high',
        })

        expect(queueSms).toHaveBeenCalled()
    })

    it('should set priority on notification', async () => {
        await sendNotification({
            userId: testUserId,
            type: 'reminder',
            title: 'Reminder',
            message: 'Remember to collect',
            priority: 'urgent',
        })

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif?.priority).toBe('urgent')
    })
})

describe('Notification Service - sendBulkNotification', () => {
    let user2Id: string

    beforeAll(async () => {
        const user2 = await UserModel.create({
            role: 'student',
            credentials: {
                passwordHash: 'test-hash',
                passwordUpdatedAt: new Date(),
                failedLoginAttempts: 0,
            },
            profile: {
                fullName: 'User Two',
                email: 'user2@example.com',
            },
            status: 'active',
        })
        user2Id = user2._id.toString()
    })

    it('should send to multiple users', async () => {
        const count = await sendBulkNotification(
            [testUserId, user2Id],
            'system_announcement',
            'System Update',
            'System will be under maintenance'
        )

        expect(count).toBe(2)

        const notifs = await NotificationModel.find({})
        expect(notifs.length).toBe(2)
    })
})

describe('Notification Service - notifyItemMatch', () => {
    it('should send item match notification', async () => {
        await notifyItemMatch(testUserId, 'ITEM-12345', 0.85)

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif?.type).toBe('item_match_found')
        expect(notif?.message).toContain('85%')
    })
})

describe('Notification Service - notifyClaimStatus', () => {
    it('should send claim approved notification', async () => {
        await notifyClaimStatus(testUserId, 'ITEM-12345', 'approved')

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif?.type).toBe('claim_approved')
        expect(notif?.title).toContain('Approved')
    })

    it('should send claim rejected notification', async () => {
        await notifyClaimStatus(testUserId, 'ITEM-12345', 'rejected', 'Insufficient proof')

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif?.type).toBe('claim_rejected')
        expect(notif?.message).toContain('not approved')
    })
})

describe('Notification Service - sendSecurityAlert', () => {
    it('should send security alert', async () => {
        await sendSecurityAlert(testUserId, 'failed_login', 'Multiple failed login attempts detected')

        const notif = await NotificationModel.findOne({ userId: testUserId })
        expect(notif?.type).toBe('security_alert')
        expect(notif?.priority).toBe('urgent')
    })
})

describe('Notification Service - sendSystemAnnouncement', () => {
    it('should send to all active users', async () => {
        const count = await sendSystemAnnouncement('Maintenance', 'System maintenance tonight')

        expect(count).toBeGreaterThanOrEqual(1)
    })

    it('should filter by roles', async () => {
        const count = await sendSystemAnnouncement('Admin Only', 'Admin message', ['admin'])

        // No admins in test data, so should be 0
        expect(count).toBe(0)
    })
})
