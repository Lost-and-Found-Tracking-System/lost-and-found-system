import { Schema, model, Types, InferSchemaType } from 'mongoose'

// USERS
const roleMetadataSchema = new Schema({
  delegatedScopes: [{ type: String }],
  delegationExpiresAt: Date,
  assignedBy: { type: Types.ObjectId },
}, { _id: false })

const credentialsSchema = new Schema({
  passwordHash: { type: String },
  passwordUpdatedAt: { type: Date, required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lastFailedAttemptAt: { type: Date },
}, { _id: false })

const profileSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  affiliation: String,
  organizationIds: [{ type: Types.ObjectId }],
}, { _id: false })

const visitorMetadataSchema = new Schema({
  otpVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { _id: false })

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

export type User = InferSchemaType<typeof userSchema>
export const UserModel = model('users', userSchema)

// LOGIN SESSIONS
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

export type LoginSession = InferSchemaType<typeof loginSessionSchema>
export const LoginSessionModel = model('login_sessions', loginSessionSchema)

// LOGIN ACTIVITY LOGS
const loginActivityLogSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  eventType: { type: String, required: true, enum: ['success', 'failure', 'logout'] },
  deviceType: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, required: true },
})

loginActivityLogSchema.index({ userId: 1, timestamp: -1 })

export type LoginActivityLog = InferSchemaType<typeof loginActivityLogSchema>
export const LoginActivityLogModel = model('login_activity_logs', loginActivityLogSchema)

// ROLES (RBAC)
const rolesSchema = new Schema({
  roleName: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  createdAt: { type: Date, required: true },
})

rolesSchema.index({ roleName: 1 }, { unique: true })

export type Role = InferSchemaType<typeof rolesSchema>
export const RoleModel = model('roles', rolesSchema)

// ROLE CHANGE AUDITS
const roleChangeAuditSchema = new Schema({
  targetUserId: { type: Types.ObjectId, required: true, ref: 'users' },
  changedBy: { type: Types.ObjectId, required: true, ref: 'users' },
  oldRole: { type: String, required: true },
  newRole: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, required: true },
})

roleChangeAuditSchema.index({ targetUserId: 1, timestamp: -1 })

export type RoleChangeAudit = InferSchemaType<typeof roleChangeAuditSchema>
export const RoleChangeAuditModel = model('role_change_audits', roleChangeAuditSchema)
