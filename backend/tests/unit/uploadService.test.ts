/**
 * @module tests/unit/uploadService
 * @description Unit tests for dual-mode upload service (Cloudinary + local fallback).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

// Mock Cloudinary configuration
vi.mock('../../src/config/cloudinary.js', () => ({
    cloudinary: {
        uploader: {
            upload_stream: vi.fn((_options, callback) => {
                // Simulate successful upload
                setTimeout(() => {
                    callback(null, {
                        url: 'http://res.cloudinary.com/test/image/upload/v123/test.jpg',
                        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
                        public_id: 'test_public_id',
                        width: 800,
                        height: 600,
                        format: 'jpg',
                        bytes: 50000,
                    })
                }, 10)
                return { end: vi.fn() }
            }),
            destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
        },
    },
    isCloudinaryConfigured: vi.fn().mockReturnValue(true),
}))

import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    LOCAL_UPLOADS_DIR,
} from '../../src/services/uploadService.js'
import { cloudinary, isCloudinaryConfigured } from '../../src/config/cloudinary.js'

describe('Upload Service — Cloudinary mode', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(isCloudinaryConfigured).mockReturnValue(true)
    })

    it('should upload image via Cloudinary when configured', async () => {
        const buffer = Buffer.from('fake-image-data')
        const result = await uploadImage(buffer)

        expect(result).toBeDefined()
        expect(result.secureUrl).toContain('https://')
        expect(result.publicId).toBe('test_public_id')
    })

    it('should pass folder option to Cloudinary', async () => {
        const buffer = Buffer.from('fake-image-data')
        await uploadImage(buffer, { folder: 'items' })

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
            expect.objectContaining({ folder: 'items' }),
            expect.any(Function)
        )
    })

    it('should upload multiple images', async () => {
        const files = [
            { buffer: Buffer.from('image1'), originalname: 'image1.jpg' },
            { buffer: Buffer.from('image2'), originalname: 'image2.jpg' },
        ]

        const results = await uploadMultipleImages(files, 'test-folder')

        expect(results).toHaveLength(2)
        results.forEach(result => {
            expect(result.secureUrl).toBeDefined()
        })
    })

    it('should delete image via Cloudinary', async () => {
        const result = await deleteImage('test_public_id')

        expect(result).toBe(true)
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test_public_id')
    })

    it('should return false on Cloudinary delete failure', async () => {
        vi.mocked(cloudinary.uploader.destroy).mockRejectedValueOnce(new Error('Failed'))

        const result = await deleteImage('invalid_id')
        expect(result).toBe(false)
    })
})

describe('Upload Service — Local fallback mode', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(isCloudinaryConfigured).mockReturnValue(false)
    })

    afterEach(() => {
        // Clean up any test files
        const testDir = LOCAL_UPLOADS_DIR
        if (fs.existsSync(testDir)) {
            const files = fs.readdirSync(testDir)
            for (const file of files) {
                if (file.includes('fake') || file.endsWith('.jpg')) {
                    try { fs.unlinkSync(path.join(testDir, file)) } catch { /* ignore */ }
                }
            }
        }
    })

    it('should upload image locally when Cloudinary is not configured', async () => {
        const buffer = Buffer.from('fake-image-data')
        const result = await uploadImage(buffer, { originalname: 'test.jpg' })

        expect(result).toBeDefined()
        expect(result.publicId).toMatch(/^local\//)
        expect(result.url).toContain('/uploads/')
        expect(result.bytes).toBe(buffer.length)

        // Cloudinary should NOT have been called
        expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled()
    })

    it('should delete local image by publicId', async () => {
        // First upload locally
        const buffer = Buffer.from('fake-image-data')
        const uploaded = await uploadImage(buffer, { originalname: 'deleteme.jpg' })

        // Then delete
        const result = await deleteImage(uploaded.publicId)
        expect(result).toBe(true)

        // Cloudinary destroy should NOT have been called
        expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
    })

    it('should return false when deleting non-Cloudinary, non-local image', async () => {
        const result = await deleteImage('some-random-id')
        expect(result).toBe(false)
    })
})

describe('Upload Service — Validation Logic', () => {
    it('should define supported formats', () => {
        const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        expect(supportedFormats).toContain('jpg')
        expect(supportedFormats).toContain('png')
    })

    it('should define max file size', () => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
        expect(MAX_FILE_SIZE).toBe(5242880)
    })

    it('should validate file extension', () => {
        const isValidExtension = (ext: string) =>
            ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())

        expect(isValidExtension('jpg')).toBe(true)
        expect(isValidExtension('PNG')).toBe(true)
        expect(isValidExtension('pdf')).toBe(false)
    })
})
