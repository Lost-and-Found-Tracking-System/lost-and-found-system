// Upload Service - Cloudinary Integration
// Handles image uploads, deletions, and transformations

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export interface UploadResult {
    url: string
    secureUrl: string
    publicId: string
    width: number
    height: number
    format: string
    bytes: number
}

export interface UploadError {
    message: string
    code?: string
}

/**
 * Upload a single image to Cloudinary
 */
export async function uploadImage(
    fileBuffer: Buffer,
    options?: {
        folder?: string
        filename?: string
        transformation?: { width?: number; height?: number; crop?: string }
    }
): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.')
    }

    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options?.folder || 'lostfound/items',
            public_id: options?.filename,
            resource_type: 'image' as const,
            transformation: options?.transformation ? [options.transformation] : undefined,
        }

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) {
                    reject(new Error(error?.message || 'Upload failed'))
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
        ).end(fileBuffer)
    })
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImages(
    files: { buffer: Buffer; originalname: string }[],
    folder?: string
): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (const file of files) {
        const result = await uploadImage(file.buffer, { folder })
        results.push(result)
    }

    return results
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured')
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId)
        return result.result === 'ok'
    } catch (error) {
        console.error('Failed to delete image:', error)
        return false
    }
}

/**
 * Get optimized URL for an image with transformations
 */
export function getOptimizedUrl(
    publicId: string,
    options?: {
        width?: number
        height?: number
        crop?: string
        quality?: string | number
        format?: string
    }
): string {
    return cloudinary.url(publicId, {
        secure: true,
        width: options?.width,
        height: options?.height,
        crop: options?.crop || 'fill',
        quality: options?.quality || 'auto',
        fetch_format: options?.format || 'auto',
    })
}
