import { createApp } from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'
import { getRedisClient, closeRedis, isUsingMemoryFallback } from './config/redis.js'
import { closeQueues, setupQueueListeners, isQueuesEnabled } from './config/queue.js'
import { initAllSchedulers } from './services/schedulers.js'

async function start() {
  // Connect to MongoDB
  await connectToDatabase()

  // Initialize Redis connection (optional - will fallback to memory if unavailable)
  try {
    const redis = getRedisClient()
    if (redis) {
      await redis.ping()
      console.log('✅ Redis connection verified')
    } else {
      console.log('📦 Using in-memory OTP storage (Redis not available)')
    }
  } catch (error) {
    console.log('📦 Using in-memory OTP storage (Redis connection failed)')
  }

  // Setup Bull queue event listeners (only if Redis is available)
  if (!isUsingMemoryFallback()) {
    setupQueueListeners()
    console.log('✅ Bull queue listeners initialized')
  } else {
    console.log('⏭️ Bull queues disabled (requires Redis)')
  }

  // Initialize background job schedulers
  initAllSchedulers()
  console.log('✅ Background schedulers initialized')

  const app = createApp()

  const server = app.listen(env.port, () => {
    console.info(`🚀 Server running on http://localhost:${env.port}`)
    console.info(`📝 Environment: ${env.nodeEnv}`)
    if (isUsingMemoryFallback()) {
      console.info('⚠️ Running in degraded mode: OTP uses in-memory storage, Bull queues disabled')
    }
  })

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`)

    server.close(async () => {
      console.log('HTTP server closed')

      // Close Redis and Bull queues
      if (isQueuesEnabled()) {
        await closeQueues()
      }
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
