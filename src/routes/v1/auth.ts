import { Router, Response } from 'express'
import { validateRequest } from '../../middleware/validation.js'
import { registerSchema, loginSchema } from '../../schemas/index.js'
import { registerUser, loginUser } from '../../services/authService.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { authMiddleware, AuthRequest } from '../../middleware/auth.js'
import { LoginSessionModel, LoginActivityLogModel, UserModel } from '../../models/index.js'
import { Types } from 'mongoose'
import crypto from 'crypto'

export const authRouter = Router()

// Failed login notification threshold
const FAILED_LOGIN_THRESHOLD = 3

authRouter.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body)

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      userId: result.userId,
      accessToken: result.accessToken,
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

authRouter.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const deviceInfo = req.headers['user-agent'] || 'Unknown'
    const ipAddress = (req.ip || req.socket.remoteAddress || '').split(':').pop() || 'Unknown'
    const approxLocation = req.headers['x-location'] as string || 'Unknown'

    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      deviceInfo,
      ipAddress,
      approxLocation,
    })

    // Log successful login activity
    await LoginActivityLogModel.create({
      userId: new Types.ObjectId(result.userId),
      eventType: 'success',
      deviceType: deviceInfo,
      location: approxLocation,
      timestamp: new Date(),
    })

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      userId: result.userId,
      role: result.role,
      accessToken: result.accessToken,
    })
  } catch (error) {
    // Log failed login attempt
    const user = await UserModel.findOne({ 'profile.email': req.body.email })
    if (user) {
      await LoginActivityLogModel.create({
        userId: user._id,
        eventType: 'failure',
        deviceType: req.headers['user-agent'] || 'Unknown',
        location: req.headers['x-location'] as string || 'Unknown',
        timestamp: new Date(),
      })

      // Check if we should send notification
      if (user.credentials.failedLoginAttempts >= FAILED_LOGIN_THRESHOLD) {
        // TODO: Send security notification email
        console.log(`🔒 SECURITY ALERT: Multiple failed login attempts for ${req.body.email}`)
      }
    }
    next(error instanceof Error ? createApiError(401, error.message) : error)
  }
})

authRouter.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (userId) {
      // Get the current token from authorization header
      const authHeader = req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        // Invalidate the current session
        await LoginSessionModel.updateOne(
          { userId: new Types.ObjectId(userId), tokenHash },
          { invalidatedAt: new Date() }
        )
      }

      // Log logout activity
      await LoginActivityLogModel.create({
        userId: new Types.ObjectId(userId),
        eventType: 'logout',
        deviceType: req.headers['user-agent'] || 'Unknown',
        location: req.headers['x-location'] as string || 'Unknown',
        timestamp: new Date(),
      })
    }

    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out successfully' })
  }
})

authRouter.post('/logout-all', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user?.userId

    if (userId) {
      // Invalidate all sessions
      await LoginSessionModel.updateMany(
        { userId: new Types.ObjectId(userId), invalidatedAt: { $exists: false } },
        { invalidatedAt: new Date() }
      )
    }

    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out from all devices' })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/refresh', (req: AuthRequest, res: Response, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw createApiError(401, 'No refresh token provided')
    }

    // Verify and generate new tokens
    // TODO: Implement refresh logic
    res.json({ accessToken: 'new-token' })
  } catch (error) {
    next(error)
  }
})

