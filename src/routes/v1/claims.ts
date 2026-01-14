import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validation.js'
import { submitClaimSchema } from '../../schemas/index.js'
import { ClaimModel, AuditLogModel } from '../../models/index.js'
import { AuthRequest } from '../../middleware/auth.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { Types } from 'mongoose'

export const claimsRouter = Router()

// Submit a claim for an item
claimsRouter.post('/', authMiddleware, validateRequest(submitClaimSchema), async (req: AuthRequest, res, next) => {
  try {
    const claim = new ClaimModel({
      itemId: new Types.ObjectId(req.body.itemId),
      claimantId: new Types.ObjectId(req.user?.userId),
      ownershipProofs: req.body.ownershipProofs,
      proofScore: 0, // Will be calculated by AI
      status: 'pending',
      confidenceTier: 'low',
      submittedAt: new Date(),
    })

    await claim.save()

    // Log the action
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'claim_submitted',
      targetEntity: 'claims',
      targetId: claim._id,
      metadata: { itemId: req.body.itemId },
      timestamp: new Date(),
    })

    res.status(201).json(claim)
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// Get claim by ID
claimsRouter.get('/:id', async (req, res, next) => {
  try {
    const claim = await ClaimModel.findById(req.params.id)
      .populate('itemId', 'trackingId submissionType')
      .populate('claimantId', 'profile.fullName profile.email')

    if (!claim) {
      throw createApiError(404, 'Claim not found')
    }

    res.json(claim)
  } catch (error) {
    next(error)
  }
})

// Get user's claims
claimsRouter.get('/user/my-claims', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const claims = await ClaimModel.find({
      claimantId: new Types.ObjectId(req.user?.userId),
    })
      .populate('itemId')
      .sort({ submittedAt: -1 })

    res.json(claims)
  } catch (error) {
    next(error)
  }
})

// Withdraw a claim
claimsRouter.post('/:id/withdraw', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const claim = await ClaimModel.findById(req.params.id)

    if (!claim) {
      throw createApiError(404, 'Claim not found')
    }

    if (claim.claimantId.toString() !== req.user?.userId) {
      throw createApiError(403, 'Unauthorized')
    }

    claim.status = 'withdrawn'
    claim.resolvedAt = new Date()
    await claim.save()

    // Log the action
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'claim_withdrawn',
      targetEntity: 'claims',
      targetId: claim._id,
      timestamp: new Date(),
    })

    res.json(claim)
  } catch (error) {
    next(error)
  }
})
