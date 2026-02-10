/**
 * @module config/database
 * @description MongoDB connection manager using Mongoose.
 * Establishes connection to MongoDB Atlas and sets up connection event listeners.
 */

import mongoose from 'mongoose'
import { env, assertRequiredEnv } from './env.js'

/**
 * Connects to the MongoDB database using the configured URI.
 * Validates required environment variables before attempting connection.
 *
 * @throws Error if `MONGODB_URI` is not set or connection fails
 */
export async function connectToDatabase(): Promise<void> {
  assertRequiredEnv()

  try {
    await mongoose.connect(env.mongoUri)
    mongoose.connection.on('connected', () => {
      console.info('MongoDB connected')
    })
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}
