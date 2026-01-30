import { Router } from 'express'
import type { Response } from 'express'
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.js'
import type { AuthRequest } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validation.js'
import { submitItemSchema, organizationSubmissionSchema, draftSaveSchema } from '../../schemas/index.js'
import {
  submitItem,
  getItemById,
  getItemsByType,
  searchItems,
  saveDraft,
  getDraft,
  deleteDraft,
  validateZone,
  submitOrganizationItem
} from '../../services/itemService.js'
import { createApiError } from '../../middleware/errorHandler.js'

export const itemsRouter = Router()

// ============ ITEM SUBMISSIONS ============

// Submit a new item (lost or found)
itemsRouter.post('/', authMiddleware, validateRequest(submitItemSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    // Validate zone
    const zoneValid = await validateZone(req.body.location.zoneId, req.body.location.coordinates)
    if (!zoneValid) {
      throw createApiError(400, 'Location is outside valid campus zones')
    }

    const item = await submitItem({
      ...req.body,
      submittedBy: req.user?.userId,
    })

    // Delete any existing draft after successful submission
    if (req.user?.userId) {
      await deleteDraft(req.user.userId)
    }

    res.status(201).json(item)
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// Submit item on behalf of an organization
itemsRouter.post('/organization', authMiddleware, validateRequest(organizationSubmissionSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const { organizationId, authorizationProof, ...itemData } = req.body

    // Validate zone
    const zoneValid = await validateZone(itemData.location.zoneId, itemData.location.coordinates)
    if (!zoneValid) {
      throw createApiError(400, 'Location is outside valid campus zones')
    }

    const item = await submitOrganizationItem({
      ...itemData,
      submittedBy: req.user?.userId,
      organizationId,
      authorizationProofUrl: authorizationProof,
    })

    res.status(201).json(item)
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// ============ DRAFT MANAGEMENT ============

// Save draft
itemsRouter.post('/drafts', authMiddleware, validateRequest(draftSaveSchema), async (req: AuthRequest, res: Response, next) => {
  try {
    const draft = await saveDraft(req.user!.userId, req.body)
    res.json(draft)
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// Get current user's draft
itemsRouter.get('/drafts/me', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const draft = await getDraft(req.user!.userId)
    if (!draft) {
      res.status(404).json({ message: 'No draft found' })
      return
    }
    res.json(draft)
  } catch (error) {
    next(error)
  }
})

// Delete draft
itemsRouter.delete('/drafts/me', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    await deleteDraft(req.user!.userId)
    res.json({ message: 'Draft deleted' })
  } catch (error) {
    next(error)
  }
})

// ============ ITEM RETRIEVAL & SEARCH ============

// Search items with advanced filters
itemsRouter.get('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      q,
      category,
      submissionType,
      status,
      dateFrom,
      dateTo,
      zoneId,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '20',
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)))
    const skip = (pageNum - 1) * limitNum

    const filters: Record<string, unknown> = {}

    if (q) {
      filters.q = q
    }
    if (category) {
      filters.category = category
    }
    if (submissionType && ['lost', 'found'].includes(submissionType as string)) {
      filters.submissionType = submissionType
    }
    if (status) {
      filters.status = status
    }
    if (dateFrom || dateTo) {
      filters.dateRange = {
        from: dateFrom ? new Date(dateFrom as string) : undefined,
        to: dateTo ? new Date(dateTo as string) : undefined,
      }
    }
    if (zoneId) {
      filters.zoneId = zoneId
    }

    const sortOptions = {
      field: sort as string,
      order: order === 'asc' ? 1 as const : -1 as const,
    }

    const result = await searchItems(filters, limitNum, skip, sortOptions, req.user?.userId)

    res.json({
      items: result.items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get all items of a specific type (lost/found)
itemsRouter.get('/type/:submissionType', async (req, res, next) => {
  try {
    const submissionType = req.params.submissionType as 'lost' | 'found'
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0

    if (!['lost', 'found'].includes(submissionType)) {
      throw createApiError(400, 'Invalid submission type')
    }

    const items = await getItemsByType(submissionType, limit, skip)
    res.json(items)
  } catch (error) {
    next(error)
  }
})

// Get item by ID (must be after other specific routes)
itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const itemId = req.params.id as string
    const item = await getItemById(itemId)
    if (!item) {
      throw createApiError(404, 'Item not found')
    }
    res.json(item)
  } catch (error) {
    next(error)
  }
})

