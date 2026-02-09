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

  app.get('/debug/claims', async (_req, res) => {
    try {
      // Dynamic import to avoid circular dependencies if any, or just import at top if safe
      const { ClaimModel } = await import('./models/index.js');
      const count = await ClaimModel.countDocuments();
      const all = await ClaimModel.find({}).limit(5);
      res.json({ count, sample: all });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/debug/generate-data', async (_req, res) => {
    try {
      const { UserModel, ItemModel, ClaimModel } = await import('./models/index.js');
      const { Types } = await import('mongoose');

      // 1. Create a dummy user
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

      // 2. Create a dummy item
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

      // 3. Create a dummy claim
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

  app.use('/api', router)

  // Error handler must be last
  app.use(errorHandler)

  return app
}
