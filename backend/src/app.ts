import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // CORS configuration for frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Location'],
  }))
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api', router)

  // Error handler must be last
  app.use(errorHandler)

  return app
}
