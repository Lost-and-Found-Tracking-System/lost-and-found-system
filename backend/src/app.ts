import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api', router)

  // Error handler must be last
  app.use(errorHandler)

  return app
}
