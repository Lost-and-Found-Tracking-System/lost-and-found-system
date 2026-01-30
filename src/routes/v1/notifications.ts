import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.js'
import { NotificationModel, AuditLogModel } from '../../models/index.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { Types } from 'mongoose'

export const notificationsRouter = Router()

/**
 * GET /api/v1/notifications
 * Get current user's notifications
 */
notificationsRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0
    const unreadOnly = req.query.unread === 'true'
    
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(req.user?.userId)
    }
    
    if (unreadOnly) {
      filter.isRead = false
    }
    
    const notifications = await NotificationModel.find(filter)
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(skip)
    
    const totalUnread = await NotificationModel.countDocuments({
      userId: new Types.ObjectId(req.user?.userId),
      isRead: false
    })
    
    res.json({
      notifications,
      totalUnread
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/notifications/:id/read
 * Mark a notification as read
 */
notificationsRouter.put('/:id/read', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(req.params.id),
        userId: new Types.ObjectId(req.user?.userId)
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      { new: true }
    )
    
    if (!notification) {
      throw createApiError(404, 'Notification not found')
    }
    
    res.json(notification)
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/notifications/read-all
 * Mark all notifications as read
 */
notificationsRouter.put('/read-all', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const result = await NotificationModel.updateMany(
      {
        userId: new Types.ObjectId(req.user?.userId),
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    )
    
    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 */
notificationsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const notification = await NotificationModel.findOneAndDelete({
      _id: new Types.ObjectId(req.params.id),
      userId: new Types.ObjectId(req.user?.userId)
    })
    
    if (!notification) {
      throw createApiError(404, 'Notification not found')
    }
    
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    next(error)
  }
})
