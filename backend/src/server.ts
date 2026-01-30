import { createApp } from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'
import { getRedisClient, closeRedis } from './config/redis.js'
import { closeQueues, setupQueueListeners } from './config/queue.js'
import { initAllSchedulers } from './services/schedulers.js'

async function start() {
  // Connect to MongoDB
  await connectToDatabase()

  // Initialize Redis connection
  try {
    const redis = getRedisClient()
    await redis.ping()
    console.log('✅ Redis connection verified')
  } catch (error) {
    console.warn('⚠️ Redis not available - OTP storage will not work:', error)
    // Continue without Redis in development
  }

  // Setup Bull queue event listeners
  setupQueueListeners()
  console.log('✅ Bull queue listeners initialized')

  // Initialize background job schedulers
  initAllSchedulers()
  console.log('✅ Background schedulers initialized')

  const app = createApp()

  const server = app.listen(env.port, () => {
    console.info(`🚀 Server running on http://localhost:${env.port}`)
    console.info(`📝 Environment: ${env.nodeEnv}`)
  })

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`)

    server.close(async () => {
      console.log('HTTP server closed')

      // Close Redis and Bull queues
      await closeQueues()
      await closeRedis()

      console.log('All connections closed')
      process.exit(0)
    })

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forcing shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

start().catch((error) => {
  console.error('Server failed to start:', error)
  process.exit(1)
})
