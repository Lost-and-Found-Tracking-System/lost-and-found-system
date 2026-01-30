import { createApp } from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'

async function start() {
  await connectToDatabase()

  const app = createApp()

  app.listen(env.port, () => {
    console.info(`Server running on http://localhost:${env.port}`)
  })
}

start().catch((error) => {
  console.error('Server failed to start:', error)
  process.exit(1)
})
