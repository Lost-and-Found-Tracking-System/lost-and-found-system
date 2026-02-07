import type { InferSchemaType } from 'mongoose'
import { model, Schema, Types } from 'mongoose'

// CLAIMS
const fraudFlagSchema = new Schema({
  type: { type: String, required: true },
  severity: { type: String, required: true, enum: ['warning', 'critical'] },
  description: { type: String, required: true },
}, { _id: false })

const fraudRiskSchema = new Schema({
  suspicionScore: { type: Number, default: 0 },
  flags: [fraudFlagSchema],
  assessedAt: { type: Date },
}, { _id: false })

const claimSchema = new Schema({
  itemId: { type: Types.ObjectId, required: true, ref: 'items' },
  claimantId: { type: Types.ObjectId, required: true, ref: 'users' },
  claimedBy: { type: Types.ObjectId, ref: 'users' }, // Alias for claimantId, used in some contexts
  ownershipProofs: [{ type: String }],
  proofScore: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'withdrawn', 'conflict', 'suspicious'] },
  aiConfidenceScore: { type: Number },
  confidenceTier: { type: String, required: true, enum: ['full', 'partial', 'low'] },
  submittedAt: { type: Date, required: true },
  resolvedAt: { type: Date },
  resolvedBy: { type: Types.ObjectId, ref: 'users' },
  adminNotes: { type: String },
  isAdminOverride: { type: Boolean, default: false },
  fraudRisk: fraudRiskSchema,
})

claimSchema.index({ itemId: 1 })
claimSchema.index({ claimantId: 1 })
claimSchema.index({ status: 1 })

export type Claim = InferSchemaType<typeof claimSchema>
export const ClaimModel = model('claims', claimSchema)

// CLAIM CONFLICTS
const claimConflictSchema = new Schema({
  itemId: { type: Types.ObjectId, required: true, ref: 'items' },
  conflictingClaims: [{ type: Types.ObjectId, ref: 'claims', required: true }],
  detectedAt: { type: Date, required: true },
  resolved: { type: Boolean, default: false },
})

claimConflictSchema.index({ itemId: 1, detectedAt: -1 })

export type ClaimConflict = InferSchemaType<typeof claimConflictSchema>
export const ClaimConflictModel = model('claim_conflicts', claimConflictSchema)

// CLAIM DECISIONS
const approvalChainSchema = new Schema({
  approverId: { type: Types.ObjectId, required: true, ref: 'users' },
  approvedAt: { type: Date, required: true },
}, { _id: false })

const claimDecisionSchema = new Schema({
  claimId: { type: Types.ObjectId, required: true, ref: 'claims' },
  decidedBy: { type: Types.ObjectId, required: true, ref: 'users' },
  decision: { type: String, required: true, enum: ['approved', 'rejected', 'override'] },
  remarks: { type: String, required: true },
  approvalChain: [approvalChainSchema],
  timestamp: { type: Date, required: true },
})

claimDecisionSchema.index({ claimId: 1, timestamp: -1 })

export type ClaimDecision = InferSchemaType<typeof claimDecisionSchema>
export const ClaimDecisionModel = model('claim_decisions', claimDecisionSchema)

// ARCHIVED CLAIMS
const archivedClaimSchema = new Schema({
  originalClaimId: { type: Types.ObjectId, required: true, ref: 'claims' },
  dataSnapshot: { type: Schema.Types.Mixed, required: true },
  archivedAt: { type: Date, required: true },
})

archivedClaimSchema.index({ archivedAt: -1 })

export type ArchivedClaim = InferSchemaType<typeof archivedClaimSchema>
export const ArchivedClaimModel = model('archived_claims', archivedClaimSchema)
