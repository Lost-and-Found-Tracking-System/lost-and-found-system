/**
 * @module models/identity
 * @description Mongoose schemas for user identity and access management.
 * Includes: Users, Login Sessions, Login Activity Logs, Roles (RBAC), and Role Change Audits.
 */

import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// ─── USERS ─────────────────────────────────────────────────────────────

/** @internal Sub-schema for delegated admin role metadata */
const roleMetadataSchema = new Schema({
  delegatedScopes: [{ type: String }],
  delegationExpiresAt: Date,
  assignedBy: { type: Types.ObjectId },
}, { _id: false })

/** @internal Sub-schema for user authentication credentials */
const credentialsSchema = new Schema({
  passwordHash: { type: String },
  passwordUpdatedAt: { type: Date, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedAttemptAt: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { _id: false })

/** @internal Sub-schema for user profile information */
const profileSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  affiliation: String,
  organizationIds: [{ type: Types.ObjectId }],
}, { _id: false })

/** @internal Sub-schema for visitor-specific metadata */
const visitorMetadataSchema = new Schema({
  otpVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { _id: false })

/**
 * User schema — represents students, faculty, visitors, and admins.
 * Supports institutional ID login, visitor OTP login, and role-based access control.
 *
 * @property institutionalId - Unique campus ID (students/faculty)
 * @property visitorId - Unique visitor identifier
 * @property role - User role: `student`, `faculty`, `visitor`, `admin`, `delegated_admin`
 * @property status - Account status: `active`, `suspended`, `expired`
 */
const userSchema = new Schema({
  institutionalId: { type: String },
  visitorId: { type: String },
  role: { type: String, required: true, enum: ['student', 'faculty', 'visitor', 'admin', 'delegated_admin'] },
  roleMetadata: roleMetadataSchema,
  credentials: { type: credentialsSchema, required: true },
  profile: { type: profileSchema, required: true },
  visitorMetadata: visitorMetadataSchema,
  status: { type: String, required: true, enum: ['active', 'suspended', 'expired'] },
}, { timestamps: true })

userSchema.index({ institutionalId: 1 }, { unique: true, sparse: true })
userSchema.index({ visitorId: 1 }, { unique: true, sparse: true })
userSchema.index({ role: 1 })
userSchema.index({ 'visitorMetadata.expiresAt': 1 }, { expireAfterSeconds: 0, sparse: true })

/** Inferred TypeScript type for the User document */
export type User = InferSchemaType<typeof userSchema>
/** Mongoose model for the `users` collection */
export const UserModel = model('users', userSchema)

// ─── LOGIN SESSIONS ────────────────────────────────────────────────────

/**
 * Login session schema — tracks active JWT refresh token sessions.
 * Sessions auto-expire via a TTL index on `expiresAt`.
 */
const loginSessionSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  tokenHash: { type: String, required: true },
  deviceInfo: { type: String, required: true },
  ipAddress: { type: String, required: true },
  approxLocation: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  invalidatedAt: { type: Date },
})

loginSessionSchema.index({ userId: 1 })
loginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

/** Inferred TypeScript type for the LoginSession document */
export type LoginSession = InferSchemaType<typeof loginSessionSchema>
/** Mongoose model for the `login_sessions` collection */
export const LoginSessionModel = model('login_sessions', loginSessionSchema)

// ─── LOGIN ACTIVITY LOGS ───────────────────────────────────────────────

/**
 * Login activity log schema — records login successes, failures, and logouts for auditing.
 */
const loginActivityLogSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  eventType: { type: String, required: true, enum: ['success', 'failure', 'logout'] },
  deviceType: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, required: true },
})

loginActivityLogSchema.index({ userId: 1, timestamp: -1 })

/** Inferred TypeScript type for the LoginActivityLog document */
export type LoginActivityLog = InferSchemaType<typeof loginActivityLogSchema>
/** Mongoose model for the `login_activity_logs` collection */
export const LoginActivityLogModel = model('login_activity_logs', loginActivityLogSchema)

// ─── ROLES (RBAC) ──────────────────────────────────────────────────────

/**
 * Role schema — defines named roles and their associated permissions for RBAC.
 */
const rolesSchema = new Schema({
  roleName: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  createdAt: { type: Date, required: true },
})

rolesSchema.index({ roleName: 1 }, { unique: true })

/** Inferred TypeScript type for the Role document */
export type Role = InferSchemaType<typeof rolesSchema>
/** Mongoose model for the `roles` collection */
export const RoleModel = model('roles', rolesSchema)

// ─── ROLE CHANGE AUDITS ────────────────────────────────────────────────

/**
 * Role change audit schema — records all role modifications for compliance tracking.
 */
const roleChangeAuditSchema = new Schema({
  targetUserId: { type: Types.ObjectId, required: true, ref: 'users' },
  changedBy: { type: Types.ObjectId, required: true, ref: 'users' },
  oldRole: { type: String, required: true },
  newRole: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, required: true },
})

roleChangeAuditSchema.index({ targetUserId: 1, timestamp: -1 })

/** Inferred TypeScript type for the RoleChangeAudit document */
export type RoleChangeAudit = InferSchemaType<typeof roleChangeAuditSchema>
/** Mongoose model for the `role_change_audits` collection */
export const RoleChangeAuditModel = model('role_change_audits', roleChangeAuditSchema)
