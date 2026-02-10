/**
 * @module config/cloudinary
 * @description Cloudinary SDK configuration for cloud-based image storage.
 * Initializes the Cloudinary v2 client with credentials from environment variables.
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: env.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: env.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
    api_secret: env.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/**
 * Checks whether Cloudinary credentials are properly configured.
 * @returns `true` if cloud_name, api_key, and api_secret are all set
 */
export function isCloudinaryConfigured(): boolean {
    const config = cloudinary.config()
    return !!(config.cloud_name && config.api_key && config.api_secret)
}
