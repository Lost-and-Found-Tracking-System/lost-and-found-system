/**
 * @module app
 * @description Express application factory. Configures middleware (CORS, JSON parsing,
 * cookie parsing), mounts API routes under `/api`, and attaches the centralized error handler.
 */

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Request, Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler } from './middleware/errorHandler.js'
import { router } from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Resolved path: <project-root>/backend/uploads
const uploadsDir = path.resolve(__dirname, '../../uploads')

/**
 * Creates and configures a new Express application instance.
 *
 * Middleware applied in order:
 * 1. CORS with configurable allowed origins
 * 2. JSON body parsing
 * 3. Cookie parsing
 * 4. API routes mounted at `/api`
 * 5. Centralized error handler
 *
 * @returns A fully configured Express application
 */
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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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

  // Root route - confirms server is live
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Campus Lost & Found API is live! 🚀',
      version: '1.0.0',
      health: '/api/health'
    })
  })

  // Debug endpoints — only available in development
  if (process.env.NODE_ENV === 'development') {
    app.get('/debug/claims', async (_req: Request, res: Response) => {
      try {
        const { ClaimModel } = await import('./models/index.js');
        const count = await ClaimModel.countDocuments();
        const all = await ClaimModel.find({}).limit(5);
        res.json({ count, sample: all });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });

    app.post('/debug/generate-data', async (_req: Request, res: Response) => {
      try {
        const { UserModel, ItemModel, ClaimModel } = await import('./models/index.js');
        const { Types } = await import('mongoose');

        const user = await UserModel.findOneAndUpdate(
          { 'profile.email': 'testuser@example.com' },
          {
            'profile.fullName': 'Test User',
            'profile.email': 'testuser@example.com',
            role: 'student',
            status: 'active'
          },
          { upsert: true, new: true }
        );

        const item = await ItemModel.create({
          trackingId: `ITEM-${Math.floor(Math.random() * 10000)}`,
          submissionType: 'found',
          submittedBy: user._id,
          isAnonymous: false,
          itemAttributes: {
            category: 'Electronics',
            description: 'Found a blue iPhone 13 near the library.',
            color: 'Blue'
          },
          location: {
            type: 'Point',
            coordinates: [0, 0],
            zoneId: new Types.ObjectId()
          },
          timeMetadata: {
            lostOrFoundAt: new Date(),
            reportedAt: new Date()
          },
          status: 'submitted',
          images: ['https://placehold.co/600x400/png']
        });

        const claim = await ClaimModel.create({
          itemId: item._id,
          claimantId: user._id,
          ownershipProofs: ['I have the receipt.', 'Unlock code is 1234.'],
          proofScore: 85,
          status: 'pending',
          aiConfidenceScore: 92,
          confidenceTier: 'full',
          submittedAt: new Date()
        });

        res.json({ message: 'Dummy data generated', claimId: claim._id });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
  }

  app.use('/api', router)

  // Serve locally-stored uploaded images (dev fallback when Cloudinary is not configured)
  app.use('/uploads', express.static(uploadsDir))

  // Error handler must be last
  app.use(errorHandler)

  return app
}
