import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth.js'
import { CampusZoneModel, AuditLogModel } from '../../models/index.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { Types } from 'mongoose'

export const zonesRouter = Router()

/**
 * GET /api/v1/zones
 * Get all campus zones (public)
 */
zonesRouter.get('/', async (req, res, next) => {
  try {
    const activeOnly = req.query.active !== 'false'
    
    const filter: Record<string, unknown> = {}
    if (activeOnly) filter.isActive = true
    
    const zones = await CampusZoneModel.find(filter)
      .select('zoneName geoBoundary isActive')
      .sort({ zoneName: 1 })
    
    res.json(zones)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/zones/:id
 * Get single zone by ID
 */
zonesRouter.get('/:id', async (req, res, next) => {
  try {
    const zone = await CampusZoneModel.findById(req.params.id)
    
    if (!zone) {
      throw createApiError(404, 'Zone not found')
    }
    
    res.json(zone)
  } catch (error) {
    next(error)
  }
})

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

/**
 * POST /api/v1/zones
 * Create new campus zone (admin only)
 */
zonesRouter.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { zoneName, geoBoundary } = req.body
    
    if (!zoneName || !geoBoundary) {
      throw createApiError(400, 'Zone name and geo boundary are required')
    }
    
    const zone = await CampusZoneModel.create({
      zoneName,
      geoBoundary,
      isActive: true,
      createdBy: new Types.ObjectId(req.user?.userId),
      updatedAt: new Date()
    })
    
    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'zone_created',
      targetEntity: 'campus_zones',
      targetId: zone._id,
      metadata: { zoneName },
      timestamp: new Date()
    })
    
    res.status(201).json(zone)
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/zones/:id
 * Update campus zone (admin only)
 */
zonesRouter.put('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { zoneName, geoBoundary, isActive } = req.body
    
    const zone = await CampusZoneModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(zoneName && { zoneName }),
          ...(geoBoundary && { geoBoundary }),
          ...(typeof isActive === 'boolean' && { isActive }),
          updatedAt: new Date()
        }
      },
      { new: true }
    )
    
    if (!zone) {
      throw createApiError(404, 'Zone not found')
    }
    
    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'zone_updated',
      targetEntity: 'campus_zones',
      targetId: zone._id,
      metadata: { updatedFields: Object.keys(req.body) },
      timestamp: new Date()
    })
    
    res.json(zone)
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/v1/zones/:id
 * Delete campus zone (admin only)
 */
zonesRouter.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const zone = await CampusZoneModel.findByIdAndDelete(req.params.id)
    
    if (!zone) {
      throw createApiError(404, 'Zone not found')
    }
    
    // Audit log
    await AuditLogModel.create({
      actorId: new Types.ObjectId(req.user?.userId),
      action: 'zone_deleted',
      targetEntity: 'campus_zones',
      targetId: new Types.ObjectId(req.params.id),
      metadata: { zoneName: zone.zoneName },
      timestamp: new Date()
    })
    
    res.json({ message: 'Zone deleted' })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/zones/validate-location
 * Check if a location is within any valid campus zone
 */
zonesRouter.post('/validate-location', async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body
    
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      throw createApiError(400, 'Valid longitude and latitude are required')
    }
    
    // Find zone containing this point
    const zone = await CampusZoneModel.findOne({
      isActive: true,
      geoBoundary: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        }
      }
    })
    
    res.json({
      valid: !!zone,
      zone: zone ? { id: zone._id, name: zone.zoneName } : null
    })
  } catch (error) {
    next(error)
  }
})
