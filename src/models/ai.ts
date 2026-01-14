import { Schema, model, Types, InferSchemaType } from 'mongoose'

// AI MATCHES
const featureBreakdownSchema = new Schema({
  text: { type: Number, required: true },
  image: { type: Number, required: true },
  location: { type: Number, required: true },
  time: { type: Number, required: true },
}, { _id: false })

const aiMatchSchema = new Schema({
  lostItemId: { type: Types.ObjectId, required: true, ref: 'items' },
  foundItemId: { type: Types.ObjectId, required: true, ref: 'items' },
  similarityScore: { type: Number, required: true },
  featureBreakdown: { type: featureBreakdownSchema, required: true },
  status: { type: String, required: true, enum: ['accepted', 'rejected', 'overridden'] },
  generatedAt: { type: Date, required: true },
})

aiMatchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true })
aiMatchSchema.index({ similarityScore: -1 })

export type AiMatch = InferSchemaType<typeof aiMatchSchema>
export const AiMatchModel = model('ai_matches', aiMatchSchema)

// AI CONFIGURATIONS
const aiConfigurationSchema = new Schema({
  version: { type: Number, required: true },
  thresholds: {
    autoApprove: { type: Number, required: true },
    partialMatch: { type: Number, required: true },
  },
  weights: {
    text: { type: Number, required: true },
    image: { type: Number, required: true },
    location: { type: Number, required: true },
    time: { type: Number, required: true },
  },
  enabled: { type: Boolean, default: true },
  updatedBy: { type: Types.ObjectId, required: true, ref: 'users' },
  updatedAt: { type: Date, required: true },
})

aiConfigurationSchema.index({ version: 1 }, { unique: true })
aiConfigurationSchema.index({ enabled: 1 })

export type AiConfiguration = InferSchemaType<typeof aiConfigurationSchema>
export const AiConfigurationModel = model('ai_configurations', aiConfigurationSchema)

// AI DECISION VERSIONS
const aiDecisionVersionSchema = new Schema({
  matchId: { type: Types.ObjectId, required: true, ref: 'ai_matches' },
  previousState: { type: Schema.Types.Mixed, required: true },
  rolledBackBy: { type: Types.ObjectId, ref: 'users' },
  reason: { type: String },
  timestamp: { type: Date, required: true },
})

aiDecisionVersionSchema.index({ matchId: 1, timestamp: -1 })

export type AiDecisionVersion = InferSchemaType<typeof aiDecisionVersionSchema>
export const AiDecisionVersionModel = model('ai_decision_versions', aiDecisionVersionSchema)
