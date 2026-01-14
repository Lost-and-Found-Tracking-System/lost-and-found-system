import { Router, Response } from 'express'
import { validateRequest } from '../../middleware/validation.js'
import { registerSchema, loginSchema } from '../../schemas/index.js'
import { registerUser, loginUser } from '../../services/authService.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { AuthRequest } from '../../middleware/auth.js'

export const authRouter = Router()

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

    const result = await loginUser({
      email: req.body.email,
      password: req.body.password,
      deviceInfo,
      ipAddress,
      approxLocation: req.headers['x-location'] as string || 'Unknown',
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
      accessToken: result.accessToken,
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(401, error.message) : error)
  }
})

authRouter.post('/logout', (req: AuthRequest, res: Response) => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
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
