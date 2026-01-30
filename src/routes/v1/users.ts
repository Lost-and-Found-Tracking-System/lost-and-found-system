import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validation.js'
import { updateProfileSchema, updateNotificationPrefsSchema } from '../../schemas/index.js'
import { UserModel, LoginActivityLogModel, NotificationPreferencesModel, AuditLogModel } from '../../models/index.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { Types } from 'mongoose'

export const usersRouter = Router()

/**
 * GET /api/v1/users/profile
 * Get current user's profile
 */
usersRouter.get('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.user?.userId)
      .select('-credentials.passwordHash')
    
    if (!user) {
      throw createApiError(404, 'User not found')
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/users/profile
 * Update current user's profile
 */
usersRouter.put('/profile', authMiddleware, validateRequest(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.fullName': req.body.fullName,
          'profile.phone': req.body.phone,
          'profile.affiliation': req.body.affiliation,
        }
      },
      { new: true }
    ).select('-credentials.passwordHash')
    
    if (!user) {
      throw createApiError(404, 'User not found')
    }
    
    // Log the action
    await AuditLogModel.create({
      actorId: new Types.ObjectId(userId),
      action: 'profile_updated',
      targetEntity: 'users',
      targetId: new Types.ObjectId(userId),
      metadata: { updatedFields: Object.keys(req.body) },
      timestamp: new Date(),
    })
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/users/login-activity
 * Get user's recent login activity
 */
usersRouter.get('/login-activity', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const activities = await LoginActivityLogModel.find({
      userId: new Types.ObjectId(req.user?.userId)
    })
      .sort({ timestamp: -1 })
      .limit(20)
    
    res.json(activities)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/users/my-items
 * Get all items submitted by current user
 */
usersRouter.get('/my-items', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { ItemModel } = await import('../../models/index.js')
    
    const items = await ItemModel.find({
      submittedBy: new Types.ObjectId(req.user?.userId)
    })
      .sort({ createdAt: -1 })
    
    res.json(items)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/users/notification-preferences
 * Get user's notification preferences
 */
usersRouter.get('/notification-preferences', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    let prefs = await NotificationPreferencesModel.findOne({
      userId: new Types.ObjectId(req.user?.userId)
    })
    
    // Create default preferences if not exists
    if (!prefs) {
      prefs = await NotificationPreferencesModel.create({
        userId: new Types.ObjectId(req.user?.userId),
        channels: { email: true, push: true, sms: false },
        priorities: {}
      })
    }
    
    res.json(prefs)
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/users/notification-preferences
 * Update user's notification preferences
 */
usersRouter.put('/notification-preferences', authMiddleware, validateRequest(updateNotificationPrefsSchema), async (req: AuthRequest, res, next) => {
  try {
    const prefs = await NotificationPreferencesModel.findOneAndUpdate(
      { userId: new Types.ObjectId(req.user?.userId) },
      {
        $set: {
          channels: req.body.channels
        }
      },
      { new: true, upsert: true }
    )
    
    res.json(prefs)
  } catch (error) {
    next(error)
  }
})
