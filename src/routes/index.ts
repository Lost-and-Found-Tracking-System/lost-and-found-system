import { Router } from 'express'
import mongoose from 'mongoose'
import { authRouter } from './v1/auth.js'
import { itemsRouter } from './v1/items.js'
import { claimsRouter } from './v1/claims.js'

export const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState,
  })
})

// API v1 routes
router.use('/v1/auth', authRouter)
router.use('/v1/items', itemsRouter)
router.use('/v1/claims', claimsRouter)
