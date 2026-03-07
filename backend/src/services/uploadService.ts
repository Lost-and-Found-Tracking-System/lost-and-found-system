/**
 * @module services/uploadService
 * @description Dual-mode image upload service.
 * Uses Cloudinary when credentials are configured in `.env`,
 * falls back to local disk storage (`backend/uploads/`) otherwise.
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolved path: <project-root>/backend/uploads
export const LOCAL_UPLOADS_DIR = path.resolve(__dirname, '../../uploads')

function ensureUploadsDir() {
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
        fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true })
    }
}

export interface UploadResult {
    url: string
    secureUrl: string
    publicId: string
    width: number
    height: number
    format: string
    bytes: number
}

// ============ CLOUDINARY UPLOAD ============

async function uploadToCloudinary(
    fileBuffer: Buffer,
    options?: { folder?: string; filename?: string; originalname?: string }
): Promise<UploadResult> {
    const folder = options?.folder || 'lost-and-found'

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Cloudinary upload returned no result'))
                    return
                }
                resolve({
                    url: result.url,
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                })
            }
        )
        uploadStream.end(fileBuffer)
    })
}

// ============ LOCAL UPLOAD ============

function uploadToLocal(
    fileBuffer: Buffer,
    options?: { folder?: string; filename?: string; originalname?: string }
): UploadResult {
    ensureUploadsDir()

    const originalname = options?.originalname ?? options?.filename ?? 'upload'
    const ext = path.extname(originalname).toLowerCase()
    const safe = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext) ? ext : '.jpg'
    const uid = crypto.randomBytes(12).toString('hex')
    const filename = `${uid}${safe}`
    const filepath = path.join(LOCAL_UPLOADS_DIR, filename)

    fs.writeFileSync(filepath, fileBuffer)

    const baseUrl = `http://localhost:${process.env.PORT || 3000}`
    const url = `${baseUrl}/uploads/${filename}`

    console.log(`[UploadService] Saved image locally: ${filepath}`)

    return {
        url,
        secureUrl: url,
        publicId: `local/${filename}`,
        width: 0,
        height: 0,
        format: safe.replace('.', ''),
        bytes: fileBuffer.length,
    }
}

// ============ PUBLIC API ============

/**
 * Upload a single image.
 * Routes to Cloudinary when configured, otherwise saves to local disk.
 */
export async function uploadImage(
    fileBuffer: Buffer,
    options?: { folder?: string; filename?: string; originalname?: string }
): Promise<UploadResult> {
    if (isCloudinaryConfigured()) {
        console.log('[UploadService] Using Cloudinary')
        return uploadToCloudinary(fileBuffer, options)
    }
    console.log('[UploadService] Cloudinary not configured — using local storage')
    return uploadToLocal(fileBuffer, options)
}

/**
 * Upload multiple images sequentially.
 */
export async function uploadMultipleImages(
    files: { buffer: Buffer; originalname: string }[],
    folder?: string
): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    for (const file of files) {
        results.push(await uploadImage(file.buffer, { originalname: file.originalname, folder }))
    }
    return results
}

/**
 * Delete an image by its publicId.
 * Handles both Cloudinary IDs and local IDs (`local/<filename>`).
 */
export async function deleteImage(publicId: string): Promise<boolean> {
    // Local file
    if (publicId.startsWith('local/')) {
        const filename = publicId.replace(/^local\//, '')
        const filepath = path.join(LOCAL_UPLOADS_DIR, filename)
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath)
                console.log(`[UploadService] Deleted local image: ${filepath}`)
            }
            return true
        } catch (err) {
            console.error(`[UploadService] Failed to delete ${filepath}:`, err)
            return false
        }
    }

    // Cloudinary file
    if (isCloudinaryConfigured()) {
        try {
            const result = await cloudinary.uploader.destroy(publicId)
            return result.result === 'ok'
        } catch (err) {
            console.error(`[UploadService] Cloudinary delete failed for ${publicId}:`, err)
            return false
        }
    }

    return false
}
