// Cloudinary Configuration
// Cloud-based image storage service

import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: env.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: env.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
    api_secret: env.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Check if Cloudinary is properly configured
export function isCloudinaryConfigured(): boolean {
    const config = cloudinary.config()
    return !!(config.cloud_name && config.api_key && config.api_secret)
}
