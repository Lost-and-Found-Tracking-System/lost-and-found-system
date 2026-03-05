/**
 * @module routes/v1/uploads
 * @description Image upload route handlers using local disk storage.
 * Endpoints: single image upload, multiple image upload, and image deletion.
 */

import type { Response } from 'express'
import { Router } from 'express'
import multer from 'multer'
import type { AuthRequest } from '../../middleware/auth.js'
import { authMiddleware } from '../../middleware/auth.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { deleteImage, uploadImage, uploadMultipleImages } from '../../services/uploadService.js'

export const uploadsRouter = Router()

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 5,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

/**
 * POST /api/v1/uploads/image
 * Upload a single image
 */
uploadsRouter.post(
    '/image',
    authMiddleware,
    upload.single('image'),
    async (req: AuthRequest, res: Response, next) => {
        try {
            if (!req.file) {
                throw createApiError(400, 'No image file provided')
            }

            const result = await uploadImage(req.file.buffer, {
                originalname: req.file.originalname,
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
    upload.array('images', 5),
    async (req: AuthRequest, res: Response, next) => {
        try {
            const files = req.files as Express.Multer.File[]

            if (!files || files.length === 0) {
                throw createApiError(400, 'No image files provided')
            }

            const results = await uploadMultipleImages(
                files.map(f => ({ buffer: f.buffer, originalname: f.originalname }))
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
 * Delete an image by public ID (e.g. local/abc123.jpg)
 */
uploadsRouter.delete(
    '/:publicId(*)',
    authMiddleware,
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
