import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validation.js'
import { submitItemSchema } from '../../schemas/index.js'
import { submitItem, getItemById, getItemsByType, searchItems } from '../../services/itemService.js'
import { AuthRequest } from '../../middleware/auth.js'
import { createApiError } from '../../middleware/errorHandler.js'

export const itemsRouter = Router()

// Submit a new item (lost or found)
itemsRouter.post('/', authMiddleware, validateRequest(submitItemSchema), async (req: AuthRequest, res, next) => {
  try {
    const item = await submitItem({
      ...req.body,
      submittedBy: req.user?.userId,
    })
    res.status(201).json(item)
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// Get item by ID
itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id)
    if (!item) {
      throw createApiError(404, 'Item not found')
    }
    res.json(item)
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

// Search items
itemsRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = Number(req.query.skip) || 0

    const items = await searchItems(req.query, limit, skip)
    res.json(items)
  } catch (error) {
    next(error)
  }
})
