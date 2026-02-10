/**
 * @module services/authService
 * @description Authentication service handling user registration, login, and session management.
 * Uses Argon2id for password hashing and JWT for stateless authentication.
 */

import { UserModel, LoginSessionModel } from '../models/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken } from '../utils/jwt.js'
import crypto from 'crypto'

/** Input data required for user registration */
export interface RegisterInput {
  institutionalId?: string
  email: string
  fullName: string
  password: string
  phone?: string
  affiliation?: string
}

/** Input data required for user login, including device metadata for session tracking */
export interface LoginInput {
  email: string
  password: string
  deviceInfo: string
  ipAddress: string
  approxLocation: string
}

/** Response returned after successful authentication (register or login) */
export interface AuthResponse {
  userId: string
  role: string
  accessToken: string
  refreshToken: string
}

/**
 * Registers a new user, hashes their password, and returns auth tokens.
 *
 * @param input - Registration details (email, name, password)
 * @returns Auth response with userId, role, and JWT tokens
 * @throws {Error} If a user with the same email already exists
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await UserModel.findOne({ 'profile.email': input.email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await hashPassword(input.password)

  const user = new UserModel({
    institutionalId: input.institutionalId,
    role: 'student',
    credentials: {
      passwordHash,
      passwordUpdatedAt: new Date(),
      failedLoginAttempts: 0,
    },
    profile: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      affiliation: input.affiliation,
    },
    status: 'active',
  })

  await user.save()

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })

  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  })

  return {
    userId: user._id.toString(),
    role: user.role,
    accessToken,
    refreshToken,
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const user = await UserModel.findOne({ 'profile.email': input.email })

  if (!user || !user.credentials.passwordHash) {
    throw new Error('Invalid email or password')
  }

  const passwordValid = await verifyPassword(user.credentials.passwordHash, input.password)
  if (!passwordValid) {
    user.credentials.failedLoginAttempts += 1
    user.credentials.lastFailedAttemptAt = new Date()
    await user.save()
    throw new Error('Invalid email or password')
  }

  // Reset failed attempts on successful login
  user.credentials.failedLoginAttempts = 0
  user.credentials.lastFailedAttemptAt = undefined
  await user.save()

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })

  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  })

  // Create session
  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await LoginSessionModel.create({
    userId: user._id,
    tokenHash,
    deviceInfo: input.deviceInfo,
    ipAddress: input.ipAddress,
    approxLocation: input.approxLocation,
    createdAt: new Date(),
    expiresAt,
  })

  return {
    userId: user._id.toString(),
    role: user.role,
    accessToken,
    refreshToken,
  }
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId).select('-credentials.passwordHash')
  return user
}

