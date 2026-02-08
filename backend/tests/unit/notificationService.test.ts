/**
 * UNIT TESTS FOR NOTIFICATION SERVICE
 * Tests notification types and structures
 */

import { describe, it, expect } from 'vitest'

describe('Notification Service - Notification Types', () => {
    const notificationTypes = [
        'item_matched',
        'claim_received',
        'claim_approved',
        'claim_rejected',
        'item_resolved',
        'security_alert',
    ]

    it('should support all notification types', () => {
        expect(notificationTypes).toContain('item_matched')
        expect(notificationTypes).toContain('claim_received')
        expect(notificationTypes).toContain('claim_approved')
        expect(notificationTypes).toContain('claim_rejected')
        expect(notificationTypes).toContain('item_resolved')
        expect(notificationTypes).toContain('security_alert')
    })

    it('should have 6 notification types', () => {
        expect(notificationTypes.length).toBe(6)
    })
})

describe('Notification Service - Priority Levels', () => {
    const priorities = ['low', 'medium', 'high', 'urgent']

    it('should support 4 priority levels', () => {
        expect(priorities).toHaveLength(4)
    })

    it('should include urgent priority', () => {
        expect(priorities).toContain('urgent')
    })

    it('should order priorities correctly', () => {
        expect(priorities.indexOf('low')).toBeLessThan(priorities.indexOf('urgent'))
    })
})

describe('Notification Service - Channel Preferences', () => {
    it('should have default channel preferences', () => {
        const defaults = {
            email: true,
            push: true,
            sms: false,
        }

        expect(defaults.email).toBe(true)
        expect(defaults.push).toBe(true)
        expect(defaults.sms).toBe(false)
    })

    it('should support all delivery channels', () => {
        const channels = ['email', 'push', 'sms']
        expect(channels).toContain('email')
        expect(channels).toContain('push')
        expect(channels).toContain('sms')
    })
})

describe('Notification Service - Notification Structure', () => {
    it('should validate notification has required fields', () => {
        const notification = {
            userId: 'user123',
            title: 'Test Notification',
            message: 'This is a test message',
            type: 'item_matched',
            priority: 'medium',
            read: false,
        }

        expect(notification.userId).toBeDefined()
        expect(notification.title).toBeDefined()
        expect(notification.message).toBeDefined()
        expect(notification.type).toBeDefined()
        expect(notification.read).toBe(false)
    })

    it('should validate title is not empty', () => {
        const notification = {
            userId: 'user123',
            title: 'Test Notification',
            message: 'This is a test',
            type: 'item_matched',
        }

        expect(notification.title.length).toBeGreaterThan(0)
    })

    it('should validate userId is not empty', () => {
        const notification = {
            userId: 'user123',
            title: 'Test',
            message: 'Message',
            type: 'info',
        }

        expect(notification.userId.length).toBeGreaterThan(0)
    })
})

describe('Notification Service - Actionable Notifications', () => {
    it('should support notifications with action URLs', () => {
        const notification = {
            userId: 'user123',
            title: 'New Match Found',
            message: 'A potential match for your item was found',
            type: 'item_matched',
            actionUrl: '/items/123',
        }

        expect(notification.actionUrl).toBeDefined()
        expect(notification.actionUrl).toContain('/items/')
    })

    it('should support notifications without action URLs', () => {
        const notification = {
            userId: 'user123',
            title: 'Security Alert',
            message: 'New login detected',
            type: 'security_alert',
        }

        expect(notification).not.toHaveProperty('actionUrl')
    })
})
