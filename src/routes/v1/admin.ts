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
  RoleChangeAuditModel
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
 * GET /api/v1/admin/dashboard
 * Get admin dashboard statistics
 */
adminRouter.get('/dashboard', async (_req: AuthRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      totalClaims,
      pendingClaims,
      resolvedItems,
      recentActivity
    ] = await Promise.all([
      UserModel.countDocuments(),
      ItemModel.countDocuments(),
      ClaimModel.countDocuments(),
      ClaimModel.countDocuments({ status: 'pending' }),
      ItemModel.countDocuments({ status: 'resolved' }),
      AuditLogModel.find().sort({ timestamp: -1 }).limit(10)
    ])

    res.json({
      stats: {
        totalUsers,
        totalItems,
        totalClaims,
        pendingClaims,
        resolvedItems
      },
      recentActivity
    })
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

    const claim = await ClaimModel.findById(req.params.id)
    if (!claim) {
      throw createApiError(404, 'Claim not found')
    }

    claim.status = decision
    claim.resolvedAt = new Date()
    await claim.save()

    // If approved, update item status
    if (decision === 'approved') {
      await ItemModel.findByIdAndUpdate(claim.itemId, {
        status: 'resolved'
      })
    }

    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: `claim_${decision}`,
      targetEntity: 'claims',
      targetId: claim._id,
      metadata: { remarks },
      timestamp: new Date()
    })

    res.json({ message: `Claim ${decision}`, claim })
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
