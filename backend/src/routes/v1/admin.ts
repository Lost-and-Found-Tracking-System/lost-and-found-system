/**
 * @module routes/v1/admin
 * @description Admin-only route handlers (requires admin or delegated_admin role).
 * Endpoints: user management, item review, claim decisions, campus zones,
 * announcements, AI configuration, audit logs, and system maintenance triggers.
 */

import { Router } from 'express'
import type { Response } from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthRequest } from '../../middleware/auth.js'
import {
  UserModel,
  AuditLogModel,
  ClaimModel,
  ItemModel,
  AiConfigurationModel,
  AnnouncementModel,
  RoleChangeAuditModel,
  NotificationModel
} from '../../models/index.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { Types } from 'mongoose'

export const adminRouter = Router()

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req: AuthRequest, res: Response, next: () => void) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'delegated_admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }
  next()
}

// Apply auth and admin check to all routes
adminRouter.use(authMiddleware)
adminRouter.use(requireAdmin)

/**
 * GET /api/v1/admin/stats
 * Get admin stats counters
 */
adminRouter.get('/stats', async (_req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalClaims,
      pendingClaims,
      pendingItems,
      resolvedItems
    ] = await Promise.all([
      UserModel.countDocuments(),
      ItemModel.countDocuments(),
      ClaimModel.countDocuments(),
      ClaimModel.countDocuments({ status: 'pending' }),
      ItemModel.countDocuments({ status: 'pending' }),
      ItemModel.countDocuments({ status: 'resolved' })
    ])

    // Calculate detailed stats
    // Match Rate = (Resolved / Total Items) * 100
    const matchRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0

    res.json({
      totalUsers,
      totalItems,
      totalClaims,
      pendingClaims,
      pendingItems,
      resolvedItems,
      matchRate,
      avgResponseTime: 2.4 // Hardcoded for now as requested
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/activity
 * Get live activity feed (Items, Claims, Users, Audit Logs)
 */
adminRouter.get('/activity', async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50)

    // Fetch recent items
    const recentItems = await ItemModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('submittedBy', 'profile.fullName')
      .lean()

    // Fetch recent claims
    const recentClaims = await ClaimModel.find()
      .sort({ submittedAt: -1 }) // Claims use submittedAt
      .limit(limit)
      .populate('claimantId', 'profile.fullName')
      .lean()

    // Fetch recent users
    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('profile.fullName createdAt')
      .lean()

    // Fetch recent audit logs (admin actions)
    const recentAuditLogs = await AuditLogModel.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('actorId', 'profile.fullName')
      .lean()

    // Helper to format audit log messages
    const formatAuditMessage = (log: any): string => {
      const actionMessages: Record<string, string> = {
        'item_approved': `Item report approved: ${log.metadata?.newStatus || 'submitted'}`,
        'item_rejected': `Item report rejected`,
        'claim_approved': `Ownership claim approved`,
        'claim_rejected': `Ownership claim rejected`,
        'claim_submitted': `New claim submitted`,
        'claim_withdrawn': `Claim withdrawn`,
        'role_changed': `User role changed: ${log.metadata?.oldRole} → ${log.metadata?.newRole}`,
        'ai_config_updated': `AI configuration updated (v${log.metadata?.version})`,
      }
      return actionMessages[log.action] || `Action: ${log.action}`
    }

    // Normalize and combine
    const activities = [
      ...recentItems.map(item => ({
        type: 'item',
        actionType: 'new_item',
        status: item.status,
        message: `New ${item.submissionType} item reported: ${item.itemAttributes.category}`,
        user: item.submittedBy ? { fullName: (item.submittedBy as any).profile?.fullName } : { fullName: 'Anonymous' },
        images: item.images || [],
        createdAt: item.createdAt
      })),
      ...recentClaims.map(claim => ({
        type: 'claim',
        actionType: 'new_claim',
        status: claim.status,
        message: `New claim submitted for item`,
        user: claim.claimantId ? { fullName: (claim.claimantId as any).profile?.fullName } : { fullName: 'Unknown' },
        images: claim.ownershipProofs?.filter((p: string) => p.startsWith('http')) || [],
        createdAt: claim.submittedAt
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        actionType: 'new_user',
        message: `New user registered`,
        user: { fullName: user.profile?.fullName },
        createdAt: user.createdAt
      })),
      ...recentAuditLogs.map(log => ({
        type: 'audit',
        actionType: log.action,
        targetEntity: log.targetEntity,
        message: formatAuditMessage(log),
        user: log.actorId ? { fullName: (log.actorId as any).profile?.fullName } : { fullName: 'System' },
        metadata: log.metadata,
        createdAt: log.timestamp
      }))
    ]

    // Sort combined list by date desc
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Return top N
    res.json({ activities: activities.slice(0, limit) })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/audit-logs
 * Get system audit logs
 */
adminRouter.get('/audit-logs', async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = Number(req.query.skip) || 0
    const action = req.query.action as string
    const entity = req.query.entity as string

    const filter: Record<string, unknown> = {}
    if (action) filter.action = action
    if (entity) filter.targetEntity = entity

    const logs = await AuditLogModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('actorId', 'profile.fullName profile.email')

    const total = await AuditLogModel.countDocuments(filter)

    res.json({ logs, total })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/users
 * Get all users (admin only)
 */
adminRouter.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0
    const role = req.query.role as string
    const status = req.query.status as string

    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    if (status) filter.status = status

    const users = await UserModel.find(filter)
      .select('-credentials.passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await UserModel.countDocuments(filter)

    res.json({ users, total })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/users/:id/role
 * Update user role
 */
adminRouter.put('/users/:id/role', async (req: AuthRequest, res, next) => {
  try {
    const { role, reason } = req.body

    if (!role || !reason) {
      throw createApiError(400, 'Role and reason are required')
    }

    const user = await UserModel.findById(req.params.id)
    if (!user) {
      throw createApiError(404, 'User not found')
    }

    const oldRole = user.role
    user.role = role
    await user.save()

    // Log role change
    await RoleChangeAuditModel.create({
      targetUserId: new Types.ObjectId(req.params.id as string),
      changedBy: new Types.ObjectId(req.user?.userId),
      oldRole,
      newRole: role,
      reason,
      timestamp: new Date()
    })

    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'role_changed',
      targetEntity: 'users',
      targetId: new Types.ObjectId(req.params.id as string),
      metadata: { oldRole, newRole: role, reason },
      timestamp: new Date()
    })

    res.json({ message: 'Role updated', user })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/claims
 * Get all claims for admin review
 */
adminRouter.get('/claims', async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0
    const status = req.query.status as string

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const claims = await ClaimModel.find(filter)
      .populate('itemId')
      .populate('claimantId', 'profile.fullName profile.email')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await ClaimModel.countDocuments(filter)

    res.json({ claims, total })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/claims/:id/decision
 * Approve or reject a claim
 */
adminRouter.put('/claims/:id/decision', async (req: AuthRequest, res, next) => {
  try {
    const { decision, remarks } = req.body

    if (!decision || !remarks) {
      throw createApiError(400, 'Decision and remarks are required')
    }

    if (!['approved', 'rejected'].includes(decision)) {
      throw createApiError(400, 'Decision must be approved or rejected')
    }

    // Update claim with decision
    const updatedClaim = await ClaimModel.findByIdAndUpdate(
      req.params.id,
      {
        status: decision,
        adminNotes: remarks,
        resolvedBy: new Types.ObjectId(req.user?.userId),
        resolvedAt: new Date(),
      },
      { new: true }
    )

    if (!updatedClaim) {
      throw createApiError(404, 'Claim not found')
    }

    // If approved, update item status to resolved
    if (decision === 'approved') {
      await ItemModel.findByIdAndUpdate(updatedClaim.itemId, {
        status: 'resolved'
      })
    }

    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: `claim_${decision}`,
      targetEntity: 'claims',
      targetId: updatedClaim._id,
      metadata: { remarks },
      timestamp: new Date()
    })

    // Notify the claimant about the decision
    await NotificationModel.create({
      userId: updatedClaim.claimantId,
      type: decision === 'approved' ? 'claim_approved' : 'claim_rejected',
      channel: 'in_app',
      title: decision === 'approved' ? 'Claim Approved!' : 'Claim Rejected',
      message: decision === 'approved'
        ? `Your ownership claim has been approved. ${remarks ? 'Admin remarks: ' + remarks : ''}`
        : `Your ownership claim has been rejected. ${remarks ? 'Reason: ' + remarks : ''}`,
      data: { claimId: updatedClaim._id, itemId: updatedClaim.itemId },
      priority: 'high',
      sentAt: new Date(),
    })

    res.json({ message: `Claim ${decision}`, claim: updatedClaim })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/ai-config
 * Get current AI configuration
 */
adminRouter.get('/ai-config', async (_req: AuthRequest, res, next) => {
  try {
    const config = await AiConfigurationModel.findOne({ enabled: true })
      .sort({ version: -1 })

    res.json(config || {
      version: 1,
      thresholds: { autoApprove: 90, partialMatch: 70 },
      weights: { text: 70, image: 85, location: 90, time: 50 },
      enabled: true
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/ai-config
 * Update AI configuration
 */
adminRouter.put('/ai-config', async (req: AuthRequest, res, next) => {
  try {
    const { thresholds, weights } = req.body

    // Get latest version
    const latest = await AiConfigurationModel.findOne().sort({ version: -1 })
    const newVersion = (latest?.version || 0) + 1

    const config = await AiConfigurationModel.create({
      version: newVersion,
      thresholds,
      weights,
      enabled: true,
      updatedBy: new Types.ObjectId(req.user?.userId),
      updatedAt: new Date()
    })

    // Disable old configs
    await AiConfigurationModel.updateMany(
      { _id: { $ne: config._id } },
      { enabled: false }
    )

    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'ai_config_updated',
      targetEntity: 'ai_configurations',
      targetId: config._id,
      metadata: { version: newVersion, thresholds, weights },
      timestamp: new Date()
    })

    res.json(config)
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/announcements
 * Create system announcement
 */
adminRouter.post('/announcements', async (req: AuthRequest, res, next) => {
  try {
    const { title, message, targetRoles, targetZones } = req.body

    if (!title || !message) {
      throw createApiError(400, 'Title and message are required')
    }

    const announcement = await AnnouncementModel.create({
      title,
      message,
      targetRoles: targetRoles || ['student', 'faculty', 'visitor'],
      targetZones: targetZones || [],
      createdBy: new Types.ObjectId(req.user?.userId),
      sentAt: new Date()
    })

    res.status(201).json(announcement)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/announcements
 * Get all announcements
 */
adminRouter.get('/announcements', async (_req: AuthRequest, res, next) => {
  try {
    const announcements = await AnnouncementModel.find()
      .sort({ sentAt: -1 })
      .limit(50)
      .populate('createdBy', 'profile.fullName')

    res.json(announcements)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/items
 * Get all items for admin review (supports filtering by status)
 */
adminRouter.get('/items', async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0
    const status = req.query.status as string

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const items = await ItemModel.find(filter)
      .populate('submittedBy', 'profile.fullName profile.email')
      .populate('location.zoneId', 'zoneName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await ItemModel.countDocuments(filter)

    res.json({ items, total })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/items/:id/review
 * Approve or reject an item report
 */
adminRouter.put('/items/:id/review', async (req: AuthRequest, res, next) => {
  try {
    const { decision, remarks } = req.body

    if (!decision) {
      throw createApiError(400, 'Decision is required')
    }

    if (!['approved', 'rejected'].includes(decision)) {
      throw createApiError(400, 'Decision must be approved or rejected')
    }

    // Map decision to item status
    const newStatus = decision === 'approved' ? 'submitted' : 'rejected'

    // Update item with decision
    const updatedItem = await ItemModel.findByIdAndUpdate(
      req.params.id,
      {
        status: newStatus,
        adminNotes: remarks || '',
        reviewedBy: new Types.ObjectId(req.user?.userId),
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('submittedBy', 'profile.fullName profile.email')

    if (!updatedItem) {
      throw createApiError(404, 'Item not found')
    }

    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: `item_${decision}`,
      targetEntity: 'items',
      targetId: updatedItem._id,
      metadata: { remarks, newStatus },
      timestamp: new Date()
    })

    // Notify the item reporter about the decision
    if (updatedItem.submittedBy) {
      const reporterUserId = typeof updatedItem.submittedBy === 'object' && (updatedItem.submittedBy as any)._id
        ? (updatedItem.submittedBy as any)._id
        : updatedItem.submittedBy

      await NotificationModel.create({
        userId: reporterUserId,
        type: 'status',
        channel: 'in_app',
        title: decision === 'approved' ? 'Item Report Approved' : 'Item Report Rejected',
        message: decision === 'approved'
          ? `Your reported item (${updatedItem.itemAttributes?.category || 'item'}) has been approved and is now visible to others.${remarks ? ' Admin remarks: ' + remarks : ''}`
          : `Your reported item (${updatedItem.itemAttributes?.category || 'item'}) has been rejected.${remarks ? ' Reason: ' + remarks : ''}`,
        data: { itemId: updatedItem._id },
        priority: 'normal',
        sentAt: new Date(),
      })
    }

    res.json({ message: `Item ${decision}`, item: updatedItem })
  } catch (error) {
    next(error)
  }
})