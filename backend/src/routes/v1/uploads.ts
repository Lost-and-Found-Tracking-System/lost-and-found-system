// Upload Routes - Image Upload Endpoints
// POST /api/v1/uploads/image - Single image upload
// POST /api/v1/uploads/images - Multiple image upload
// DELETE /api/v1/uploads/:publicId - Delete an image

import { Router } from 'express'
import type { Response } from 'express'
import multer from 'multer'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthRequest } from '../../middleware/auth.js'
import { uploadImage, uploadMultipleImages, deleteImage } from '../../services/uploadService.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { isCloudinaryConfigured } from '../../config/cloudinary.js'

export const uploadsRouter = Router()

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 5, // Max 5 files at once
    },
    fileFilter: (_req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

// Middleware to check Cloudinary configuration
function requireCloudinary(req: AuthRequest, res: Response, next: () => void) {
    if (!isCloudinaryConfigured()) {
        res.status(503).json({
            error: 'Image upload service unavailable',
            message: 'Cloudinary is not configured. Please contact administrator.',
        })
        return
    }
    next()
}

/**
 * POST /api/v1/uploads/image
 * Upload a single image
 */
uploadsRouter.post(
    '/image',
    authMiddleware,
    requireCloudinary,
    upload.single('image'),
    async (req: AuthRequest, res: Response, next) => {
        try {
            if (!req.file) {
                throw createApiError(400, 'No image file provided')
            }

            const result = await uploadImage(req.file.buffer, {
                folder: `lostfound/items/${req.user?.userId}`,
            })

            res.status(201).json({
                message: 'Image uploaded successfully',
                image: {
                    url: result.secureUrl,
                    publicId: result.publicId,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    size: result.bytes,
                },
            })
        } catch (error) {
            next(error instanceof Error ? createApiError(400, error.message) : error)
        }
    }
)

/**
 * POST /api/v1/uploads/images
 * Upload multiple images (max 5)
 */
uploadsRouter.post(
    '/images',
    authMiddleware,
    requireCloudinary,
    upload.array('images', 5),
    async (req: AuthRequest, res: Response, next) => {
        try {
            const files = req.files as Express.Multer.File[]

            if (!files || files.length === 0) {
                throw createApiError(400, 'No image files provided')
            }

            const results = await uploadMultipleImages(
                files.map(f => ({ buffer: f.buffer, originalname: f.originalname })),
                `lostfound/items/${req.user?.userId}`
            )

            res.status(201).json({
                message: `${results.length} image(s) uploaded successfully`,
                images: results.map(r => ({
                    url: r.secureUrl,
                    publicId: r.publicId,
                    width: r.width,
                    height: r.height,
                    format: r.format,
                    size: r.bytes,
                })),
            })
        } catch (error) {
            next(error instanceof Error ? createApiError(400, error.message) : error)
        }
    }
)

/**
 * DELETE /api/v1/uploads/:publicId
 * Delete an image by public ID
 */
uploadsRouter.delete(
    '/:publicId(*)',
    authMiddleware,
    requireCloudinary,
    async (req: AuthRequest, res: Response, next) => {
        try {
            const publicId = req.params.publicId as string

            if (!publicId) {
                throw createApiError(400, 'Public ID is required')
            }

            const success = await deleteImage(publicId)

            if (!success) {
                throw createApiError(404, 'Image not found or already deleted')
            }

            res.json({ message: 'Image deleted successfully' })
        } catch (error) {
            next(error instanceof Error ? createApiError(400, error.message) : error)
        }
    }
)
