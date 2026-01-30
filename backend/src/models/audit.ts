import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// AUDIT LOGS
const auditLogSchema = new Schema({
  actorId: { type: Types.ObjectId, required: true, ref: 'users' },
  action: { type: String, required: true },
  targetEntity: { type: String, required: true },
  targetId: { type: Types.ObjectId, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, required: true },
})

auditLogSchema.index({ targetEntity: 1, targetId: 1 })
auditLogSchema.index({ timestamp: -1 })

export type AuditLog = InferSchemaType<typeof auditLogSchema>
export const AuditLogModel = model('audit_logs', auditLogSchema)

// DATA RETENTION POLICIES
const dataRetentionPolicySchema = new Schema({
  entity: { type: String, required: true },
  retentionDays: { type: Number, required: true },
  action: { type: String, required: true, enum: ['delete', 'anonymize'] },
})

dataRetentionPolicySchema.index({ entity: 1 }, { unique: true })

export type DataRetentionPolicy = InferSchemaType<typeof dataRetentionPolicySchema>
export const DataRetentionPolicyModel = model('data_retention_policies', dataRetentionPolicySchema)
