import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // CORS configuration - allow both production and localhost
  const allowedOrigins = [
    process.env.FRONTEND_URL,           // Production frontend (e.g., Vercel)
    'http://localhost:5173',            // Vite dev server
    'http://localhost:3000',            // React dev server
    'http://localhost:5174',            // Vite alt port
    'http://127.0.0.1:5173',            // Localhost alternative
  ].filter(Boolean) as string[]

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`CORS blocked origin: ${origin}`)
        callback(null, false)
      }
    },
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
