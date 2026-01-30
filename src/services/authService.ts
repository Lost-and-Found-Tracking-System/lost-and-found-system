import { UserModel, LoginSessionModel } from '../models/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken } from '../utils/jwt.js'
import crypto from 'crypto'

export interface RegisterInput {
  institutionalId?: string
  email: string
  fullName: string
  password: string
  phone?: string
  affiliation?: string
}

export interface LoginInput {
  email: string
  password: string
  deviceInfo: string
  ipAddress: string
  approxLocation: string
}

export interface AuthResponse {
  userId: string
  role: string
  accessToken: string
  refreshToken: string
}

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

