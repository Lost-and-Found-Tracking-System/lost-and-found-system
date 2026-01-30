import mongoose from 'mongoose'
import { env, assertRequiredEnv } from './env.js'

export async function connectToDatabase(): Promise<void> {
  assertRequiredEnv()

  try {
    await mongoose.connect(env.mongoUri)
    // Connection events are logged here for visibility during setup.
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
