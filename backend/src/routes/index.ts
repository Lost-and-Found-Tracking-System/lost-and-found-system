import { Router } from 'express'
import mongoose from 'mongoose'
import { adminRouter } from './v1/admin.js'
import { aiRouter } from './v1/ai.js'
import { authRouter } from './v1/auth.js'
import { claimsRouter } from './v1/claims.js'
import { itemsRouter } from './v1/items.js'
import { notificationsRouter } from './v1/notifications.js'
import { uploadsRouter } from './v1/uploads.js'
import { usersRouter } from './v1/users.js'
import { zonesRouter } from './v1/zones.js'

export const router = Router()

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ============================================
// API v1 routes
// ============================================

// Authentication routes
router.use('/v1/auth', authRouter)

// User profile and settings routes
router.use('/v1/users', usersRouter)

// Item management routes (lost/found)
router.use('/v1/items', itemsRouter)

// Claims routes
router.use('/v1/claims', claimsRouter)

// Notifications routes
router.use('/v1/notifications', notificationsRouter)

// Campus zones routes
router.use('/v1/zones', zonesRouter)

// Image upload routes
router.use('/v1/uploads', uploadsRouter)

// AI routes (matching, fraud detection, analytics)
router.use('/v1/ai', aiRouter)

// Admin routes (protected)
router.use('/v1/admin', adminRouter)
