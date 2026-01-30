import { Router } from 'express'
import type { Response } from 'express'
import { validateRequest } from '../../middleware/validation.js'
import { registerSchema, loginSchema } from '../../schemas/index.js'
import { registerUser, loginUser } from '../../services/authService.js'
import { createApiError } from '../../middleware/errorHandler.js'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthRequest } from '../../middleware/auth.js'
import { LoginSessionModel, LoginActivityLogModel, UserModel } from '../../models/index.js'
import { Types } from 'mongoose'
import crypto from 'crypto'
import {
  initiateVisitorRegistration,
  completeVisitorRegistration,
  initiatePasswordReset,
  verifyOtp,
} from '../../services/otpService.js'
import { sendSecurityAlert } from '../../services/notificationService.js'
import argon2 from 'argon2'

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

      // Send security notification if threshold exceeded
      if (user.credentials.failedLoginAttempts >= FAILED_LOGIN_THRESHOLD) {
        await sendSecurityAlert(
          user._id.toString(),
          'Multiple Failed Login Attempts',
          `We detected ${user.credentials.failedLoginAttempts} failed login attempts on your account. If this wasn't you, please secure your account immediately.`
        )
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
  } catch (_error) {
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

authRouter.post('/refresh', async (req: AuthRequest, res: Response, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw createApiError(401, 'No refresh token provided')
    }

    // Verify the refresh token
    const { verifyRefreshToken, signAccessToken } = await import('../../utils/jwt.js')
    const payload = verifyRefreshToken(refreshToken)

    if (!payload) {
      throw createApiError(401, 'Invalid or expired refresh token')
    }

    // Verify user still exists and is active
    const user = await UserModel.findById(payload.userId)
    if (!user || user.status !== 'active') {
      throw createApiError(401, 'User not found or inactive')
    }

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: payload.userId,
      role: user.role,
    })

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    next(error)
  }
})

// ============ VISITOR REGISTRATION (Phone-based OTP) ============

/**
 * POST /api/v1/auth/visitor/request-otp
 * Request OTP for visitor registration via phone
 */
authRouter.post('/visitor/request-otp', async (req, res, next) => {
  try {
    const { phone } = req.body

    if (!phone) {
      throw createApiError(400, 'Phone number is required')
    }

    await initiateVisitorRegistration(phone)

    res.json({
      message: 'OTP sent to your phone number',
      expiresIn: 600, // 10 minutes
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

/**
 * POST /api/v1/auth/visitor/verify
 * Complete visitor registration by verifying phone OTP
 */
authRouter.post('/visitor/verify', async (req, res, next) => {
  try {
    const { phone, fullName, email, otp } = req.body

    if (!phone || !fullName || !otp) {
      throw createApiError(400, 'Phone, full name, and OTP are required')
    }

    const result = await completeVisitorRegistration({
      phone,
      fullName,
      email,
      otp,
    })

    res.status(201).json({
      message: 'Visitor registration successful',
      userId: result.userId,
      expiresAt: result.expiresAt,
      note: 'Your temporary account will expire in 24 hours',
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

// ============ PASSWORD RESET (Email-based OTP) ============

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset OTP via email
 */
authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      throw createApiError(400, 'Email is required')
    }

    await initiatePasswordReset(email)

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account exists with this email, you will receive a password reset OTP',
      expiresIn: 600,
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

/**
 * POST /api/v1/auth/verify-reset-otp
 * Verify the password reset OTP
 */
authRouter.post('/verify-reset-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      throw createApiError(400, 'Email and OTP are required')
    }

    const isValid = await verifyOtp(email, otp, 'password_reset')

    if (!isValid) {
      throw createApiError(400, 'Invalid or expired OTP')
    }

    // Generate a temporary reset token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Store reset token temporarily (using Redis would be better)
    await UserModel.updateOne(
      { 'profile.email': email },
      {
        passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      }
    )

    res.json({
      message: 'OTP verified successfully',
      resetToken,
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

/**
 * POST /api/v1/auth/reset-password
 * Reset password using the reset token
 */
authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body

    if (!resetToken || !newPassword) {
      throw createApiError(400, 'Reset token and new password are required')
    }

    if (newPassword.length < 8) {
      throw createApiError(400, 'Password must be at least 8 characters')
    }

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    const user = await UserModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!user) {
      throw createApiError(400, 'Invalid or expired reset token')
    }

    // Hash new password
    const passwordHash = await argon2.hash(newPassword)

    // Update password and clear reset token
    await UserModel.updateOne(
      { _id: user._id },
      {
        'credentials.passwordHash': passwordHash,
        'credentials.passwordUpdatedAt': new Date(),
        'credentials.failedLoginAttempts': 0,
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      }
    )

    // Invalidate all existing sessions
    await LoginSessionModel.updateMany(
      { userId: user._id, invalidatedAt: { $exists: false } },
      { invalidatedAt: new Date() }
    )

    res.json({ message: 'Password reset successful. Please login with your new password.' })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})


