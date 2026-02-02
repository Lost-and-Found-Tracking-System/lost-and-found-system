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
import { signAccessToken, signRefreshToken } from '../../utils/jwt.js'
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

    // Approximate location from IP (in production, use a geo-IP service)
    const approxLocation = 'Unknown'

    const result = await loginUser({
      ...req.body,
      deviceInfo,
      ipAddress,
      approxLocation,
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
    // Log failed attempt if user exists
    const user = await UserModel.findOne({ 'profile.email': req.body.email })
    if (user) {
      // Increment failed login attempts
      user.credentials.failedLoginAttempts = (user.credentials.failedLoginAttempts || 0) + 1
      await user.save()

      // Log the failed attempt
      await LoginActivityLogModel.create({
        userId: user._id,
        eventType: 'failure',
        timestamp: new Date(),
        ipAddress: (req.ip || req.socket.remoteAddress || '').split(':').pop() || 'Unknown',
        deviceType: req.headers['user-agent'] || 'Unknown',
        location: 'Unknown',
      })

      // Send security alert if threshold reached
      if (user.credentials.failedLoginAttempts >= FAILED_LOGIN_THRESHOLD) {
        try {
          await sendSecurityAlert(user._id.toString(), {
            eventType: 'multiple_failed_logins',
            deviceType: req.headers['user-agent'] || 'Unknown',
            location: 'Unknown',
          })
        } catch (alertError) {
          console.error('Failed to send security alert:', alertError)
        }
      }
    }

    next(error instanceof Error ? createApiError(401, error.message) : error)
  }
})

authRouter.post('/logout', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.userId

    // Log the logout
    await LoginActivityLogModel.create({
      userId: new Types.ObjectId(userId),
      eventType: 'logout',
      timestamp: new Date(),
      ipAddress: (req.ip || req.socket.remoteAddress || '').split(':').pop() || 'Unknown',
      deviceType: req.headers['user-agent'] || 'Unknown',
      location: 'Unknown',
    })

    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    // Delete all sessions for this user (optional: could just delete current session)
    await LoginSessionModel.deleteMany({ userId: new Types.ObjectId(userId) })

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error instanceof Error ? createApiError(500, error.message) : error)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw createApiError(401, 'Refresh token not found')
    }

    // Find session with this refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const session = await LoginSessionModel.findOne({ tokenHash })

    if (!session) {
      throw createApiError(401, 'Invalid refresh token')
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await LoginSessionModel.deleteOne({ _id: session._id })
      throw createApiError(401, 'Session expired')
    }

    // Get user
    const user = await UserModel.findById(session.userId)
    if (!user) {
      throw createApiError(401, 'User not found')
    }

    // Generate new access token
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    })

    res.json({ accessToken })
  } catch (error) {
    next(error instanceof Error ? createApiError(401, error.message) : error)
  }
})

// ============ VISITOR OTP REGISTRATION ============

/**
 * POST /api/v1/auth/visitor/request-otp
 * Request OTP for visitor phone verification
 */
authRouter.post('/visitor/request-otp', async (req, res, next) => {
  try {
    const { phone } = req.body

    if (!phone) {
      throw createApiError(400, 'Phone number is required')
    }

    // Normalize phone number
    let normalizedPhone = phone.trim()
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.length === 10) {
        normalizedPhone = '+91' + normalizedPhone
      } else {
        normalizedPhone = '+' + normalizedPhone
      }
    }

    // Check if user already exists with this phone
    const existingUser = await UserModel.findOne({ 'profile.phone': normalizedPhone })
    if (existingUser) {
      throw createApiError(400, 'A user with this phone number already exists')
    }

    // This function returns void, just sends OTP
    await initiateVisitorRegistration(normalizedPhone)

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes (OTP validity from createOtp function)
    })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

/**
 * POST /api/v1/auth/visitor/verify
 * Complete visitor registration by verifying phone OTP
 * NOW RETURNS accessToken for auto-login!
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

    // Fetch the created visitor user to generate tokens
    const visitor = await UserModel.findById(result.userId)
    if (!visitor) {
      throw createApiError(500, 'Visitor creation failed')
    }

    // Generate access token for auto-login
    const accessToken = signAccessToken({
      userId: visitor._id.toString(),
      role: visitor.role,
    })

    // Generate refresh token
    const refreshToken = signRefreshToken({
      userId: visitor._id.toString(),
      role: visitor.role,
    })

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (visitor expiry)
    })

    res.status(201).json({
      message: 'Visitor registration successful',
      userId: result.userId,
      accessToken: accessToken,  // NOW INCLUDED!
      expiresAt: result.expiresAt,
      role: 'visitor',
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
 * POST /api/v1/auth/reset-password
 * Reset password using OTP
 */
authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      throw createApiError(400, 'Email, OTP, and new password are required')
    }

    // Verify OTP
    const isValid = await verifyOtp(email, otp, 'password_reset')
    if (!isValid) {
      throw createApiError(400, 'Invalid or expired OTP')
    }

    // Find user and update password
    const user = await UserModel.findOne({ 'profile.email': email })
    if (!user) {
      throw createApiError(404, 'User not found')
    }

    // Hash new password
    const passwordHash = await argon2.hash(newPassword)

    user.credentials.passwordHash = passwordHash
    user.credentials.passwordUpdatedAt = new Date()
    user.credentials.failedLoginAttempts = 0
    await user.save()

    // Invalidate all existing sessions
    await LoginSessionModel.deleteMany({ userId: user._id })

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 */
authRouter.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user!.userId

    if (!currentPassword || !newPassword) {
      throw createApiError(400, 'Current password and new password are required')
    }

    const user = await UserModel.findById(userId)
    if (!user || !user.credentials.passwordHash) {
      throw createApiError(404, 'User not found')
    }

    // Verify current password
    const isValid = await argon2.verify(user.credentials.passwordHash, currentPassword)
    if (!isValid) {
      throw createApiError(401, 'Current password is incorrect')
    }

    // Hash and save new password
    const passwordHash = await argon2.hash(newPassword)
    user.credentials.passwordHash = passwordHash
    user.credentials.passwordUpdatedAt = new Date()
    await user.save()

    // Optionally invalidate other sessions
    // await LoginSessionModel.deleteMany({ userId: user._id })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error instanceof Error ? createApiError(400, error.message) : error)
  }
})