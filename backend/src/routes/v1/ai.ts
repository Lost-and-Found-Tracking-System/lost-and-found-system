/**
 * AI Routes for Lost & Found System
 *
 * Exposes AI-related endpoints:
 * - Real-time suggestions during submission
 * - AI matches for items
 * - AI performance analytics (admin)
 * - Fraud assessment
 */

import type { Response } from 'express'
import { Router } from 'express'
import { Types } from 'mongoose'
import type { AuthRequest } from '../../middleware/auth.js'
import { authMiddleware } from '../../middleware/auth.js'
import { createApiError } from '../../middleware/errorHandler.js'

// Service imports
import {
    analyzeThresholdEffectiveness,
    calculateAccuracyOverTime,
    getAIPerformanceMetrics,
    getFraudAnalytics,
    getMatchStatsByCategory,
} from '../../services/aiAnalyticsService.js'
import {
    findQuickMatches,
    findSimilarItems,
    getTopMatches,
    processMatchDecision,
} from '../../services/embeddingService.js'
import {
    assessClaimRisk,
    evaluateCompetingClaims,
    processCompetingClaims,
} from '../../services/fraudDetectionService.js'

export const aiRouter = Router()

// ============ MIDDLEWARE ============

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

// Apply auth to all routes
aiRouter.use(authMiddleware)

// ============ PUBLIC AI ENDPOINTS ============

/**
 * GET /api/v1/ai/suggestions
 * Get real-time suggestions while filling submission form
 * Called by frontend during item submission
 */
aiRouter.get('/suggestions', async (req: AuthRequest, res, next) => {
    try {
        const { category, description, zoneId } = req.query

        if (!category || !description) {
            throw createApiError(400, 'Category and description are required')
        }

        const suggestions = await findQuickMatches({
            category: category as string,
            description: description as string,
            zoneId: zoneId as string | undefined,
            limit: 5,
        })

        res.json({ suggestions })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/matches/:itemId
 * Get AI-suggested matches for an item
 */
aiRouter.get('/matches/:itemId', async (req: AuthRequest, res, next) => {
    try {
        const itemId = req.params.itemId as string
        const limit = Math.min(Number(req.query.limit) || 10, 50)

        if (!Types.ObjectId.isValid(itemId)) {
            throw createApiError(400, 'Invalid item ID')
        }

        const matches = await getTopMatches(itemId, limit)

        res.json({ matches })
    } catch (error) {
        next(error)
    }
})

/**
 * POST /api/v1/ai/find-similar
 * Trigger AI similarity matching for an item
 */
aiRouter.post('/find-similar', async (req: AuthRequest, res, next) => {
    try {
        const { itemId, submissionType } = req.body

        if (!itemId || !submissionType) {
            throw createApiError(400, 'itemId and submissionType are required')
        }

        if (!Types.ObjectId.isValid(itemId)) {
            throw createApiError(400, 'Invalid item ID')
        }

        const results = await findSimilarItems(itemId, submissionType)

        res.json({
            message: 'Similarity matching complete',
            matchCount: results.length,
            results,
        })
    } catch (error) {
        next(error)
    }
})

// ============ FRAUD DETECTION ENDPOINTS ============

/**
 * POST /api/v1/ai/assess-claim
 * Assess fraud risk for a single claim
 */
aiRouter.post('/assess-claim', async (req: AuthRequest, res, next) => {
    try {
        const { claimId } = req.body

        if (!claimId) {
            throw createApiError(400, 'claimId is required')
        }

        if (!Types.ObjectId.isValid(claimId)) {
            throw createApiError(400, 'Invalid claim ID')
        }

        const assessment = await assessClaimRisk(claimId)

        res.json({
            message: 'Fraud risk assessed',
            assessment,
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/competing-claims/:itemId
 * Evaluate competing claims for an item (preview without processing)
 */
aiRouter.get('/competing-claims/:itemId', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const itemId = req.params.itemId as string

        if (!Types.ObjectId.isValid(itemId)) {
            throw createApiError(400, 'Invalid item ID')
        }

        const result = await evaluateCompetingClaims(itemId)

        res.json(result)
    } catch (error) {
        next(error)
    }
})

/**
 * POST /api/v1/ai/process-claims/:itemId
 * Process competing claims: award winner, mark others as suspicious
 */
aiRouter.post('/process-claims/:itemId', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const itemId = req.params.itemId as string

        if (!Types.ObjectId.isValid(itemId)) {
            throw createApiError(400, 'Invalid item ID')
        }

        const result = await processCompetingClaims(itemId)

        res.json({
            message: 'Claims processed',
            ...result,
        })
    } catch (error) {
        next(error)
    }
})

// ============ MATCH DECISION ENDPOINTS ============

/**
 * POST /api/v1/ai/matches/:matchId/decision
 * Accept or reject an AI-suggested match
 */
aiRouter.post('/matches/:matchId/decision', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const matchId = req.params.matchId as string
        const { decision, reason } = req.body

        if (!matchId || !decision) {
            throw createApiError(400, 'matchId and decision are required')
        }

        if (!['accepted', 'rejected'].includes(decision)) {
            throw createApiError(400, 'Decision must be accepted or rejected')
        }

        if (!Types.ObjectId.isValid(matchId)) {
            throw createApiError(400, 'Invalid match ID')
        }

        await processMatchDecision(matchId, decision, req.user!.userId, reason)

        res.json({ message: `Match ${decision}` })
    } catch (error) {
        next(error)
    }
})

// ============ ANALYTICS ENDPOINTS (ADMIN ONLY) ============

/**
 * GET /api/v1/ai/analytics
 * Get AI performance metrics
 */
aiRouter.get('/analytics', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined

        const metrics = await getAIPerformanceMetrics(startDate, endDate)

        res.json(metrics)
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/analytics/accuracy
 * Get accuracy over time
 */
aiRouter.get('/analytics/accuracy', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined

        const accuracy = await calculateAccuracyOverTime(startDate, endDate)

        res.json({ accuracy })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/analytics/fraud
 * Get fraud detection analytics
 */
aiRouter.get('/analytics/fraud', requireAdmin, async (req: AuthRequest, res, next) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined

        const fraudAnalytics = await getFraudAnalytics(startDate, endDate)

        res.json(fraudAnalytics)
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/analytics/categories
 * Get match statistics by category
 */
aiRouter.get('/analytics/categories', requireAdmin, async (_req: AuthRequest, res, next) => {
    try {
        const stats = await getMatchStatsByCategory()

        res.json({ categories: stats })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/v1/ai/analytics/thresholds
 * Analyze threshold effectiveness
 */
aiRouter.get('/analytics/thresholds', requireAdmin, async (_req: AuthRequest, res, next) => {
    try {
        const analysis = await analyzeThresholdEffectiveness()

        res.json(analysis)
    } catch (error) {
        next(error)
    }
})
