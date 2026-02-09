import { Router } from 'express'
import type { Response } from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthRequest } from '../../middleware/auth.js'
import { ItemModel, ClaimModel } from '../../models/index.js'
import { Types } from 'mongoose'

export const dashboardRouter = Router()

/**
 * GET /api/v1/dashboard/stats
 * Get dashboard statistics for the current user
 */
dashboardRouter.get('/stats', authMiddleware, async (req: AuthRequest, res: Response, next) => {
    try {
        const userId = new Types.ObjectId(req.user?.userId)

        // Get user's items count
        const totalReported = await ItemModel.countDocuments({ submittedBy: userId })

        // Get user's claims count
        const totalClaims = await ClaimModel.countDocuments({ claimantId: userId })

        // Get user's pending claims
        const pendingClaims = await ClaimModel.countDocuments({
            claimantId: userId,
            status: 'pending'
        })

        // Get resolved items (items submitted by user that are resolved)
        const resolvedItems = await ItemModel.countDocuments({
            submittedBy: userId,
            status: 'resolved'
        })

        res.json({
            totalReported,
            totalClaims,
            pendingClaims,
            resolvedItems
        })
    } catch (error) {
        next(error)
    }
})
