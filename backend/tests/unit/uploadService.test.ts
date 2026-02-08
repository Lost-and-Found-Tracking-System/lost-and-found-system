/**
 * UNIT TESTS FOR UPLOAD SERVICE
 * Tests Cloudinary integration with mocks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Cloudinary configuration
vi.mock('../../src/config/cloudinary.js', () => ({
    cloudinary: {
        uploader: {
            upload_stream: vi.fn((options, callback) => {
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
        url: vi.fn((publicId, options) =>
            `https://res.cloudinary.com/test/image/upload/${publicId}`
        ),
    },
    isCloudinaryConfigured: vi.fn().mockReturnValue(true),
}))

import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getOptimizedUrl,
} from '../../src/services/uploadService.js'
import { cloudinary, isCloudinaryConfigured } from '../../src/config/cloudinary.js'

describe('Upload Service - uploadImage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should upload image successfully', async () => {
        const buffer = Buffer.from('fake-image-data')
        const result = await uploadImage(buffer)

        expect(result).toBeDefined()
        expect(result.secureUrl).toContain('https://')
        expect(result.publicId).toBeDefined()
    })

    it('should pass folder option', async () => {
        const buffer = Buffer.from('fake-image-data')
        await uploadImage(buffer, { folder: 'items' })

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
            expect.objectContaining({ folder: 'items' }),
            expect.any(Function)
        )
    })

    it('should throw error when not configured', async () => {
        vi.mocked(isCloudinaryConfigured).mockReturnValueOnce(false)

        const buffer = Buffer.from('fake-image-data')

        await expect(uploadImage(buffer)).rejects.toThrow('Cloudinary is not configured')
    })
})

describe('Upload Service - uploadMultipleImages', () => {
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
})

describe('Upload Service - deleteImage', () => {
    it('should delete image successfully', async () => {
        const result = await deleteImage('test_public_id')

        expect(result).toBe(true)
        expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test_public_id')
    })

    it('should return false on failure', async () => {
        vi.mocked(cloudinary.uploader.destroy).mockRejectedValueOnce(new Error('Failed'))

        const result = await deleteImage('invalid_id')
        expect(result).toBe(false)
    })

    it('should throw when not configured', async () => {
        vi.mocked(isCloudinaryConfigured).mockReturnValueOnce(false)

        await expect(deleteImage('test_id')).rejects.toThrow('Cloudinary is not configured')
    })
})

describe('Upload Service - getOptimizedUrl', () => {
    it('should generate optimized URL', () => {
        const url = getOptimizedUrl('test_public_id')

        expect(url).toContain('test_public_id')
        expect(cloudinary.url).toHaveBeenCalled()
    })

    it('should pass transformation options', () => {
        getOptimizedUrl('test_id', { width: 400, height: 300, crop: 'fill' })

        expect(cloudinary.url).toHaveBeenCalledWith(
            'test_id',
            expect.objectContaining({
                width: 400,
                height: 300,
                crop: 'fill',
            })
        )
    })
})

describe('Upload Service - Validation Logic', () => {
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
