/**
 * @module services/uploadService
 * @description Image upload service using local disk storage.
 * Files are saved to `backend/uploads/` and served at `/uploads/<filename>`.
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

/**
 * Upload a single image to local disk.
 * Returns a localhost URL that can be used just like a Cloudinary URL.
 */
export async function uploadImage(
    fileBuffer: Buffer,
    options?: {
        folder?: string
        filename?: string
        originalname?: string
    }
): Promise<UploadResult> {
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

/**
 * Upload multiple images sequentially.
 */
export async function uploadMultipleImages(
    files: { buffer: Buffer; originalname: string }[],
    _folder?: string
): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    for (const file of files) {
        results.push(await uploadImage(file.buffer, { originalname: file.originalname }))
    }
    return results
}

/**
 * Delete a locally-stored image by its publicId (`local/<filename>`).
 */
export async function deleteImage(publicId: string): Promise<boolean> {
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
