import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// ITEMS
const itemAttributesSchema = new Schema({
  category: { type: String, required: true },
  color: { type: String },
  material: { type: String },
  size: { type: String },
  description: { type: String, required: true },
}, { _id: false })

const itemLocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: (val: number[]) => val.length === 2,
  },
  zoneId: { type: Types.ObjectId, required: true, ref: 'campus_zones' },
}, { _id: false })

const itemTimeMetadataSchema = new Schema({
  lostOrFoundAt: { type: Date, required: true },
  reportedAt: { type: Date, required: true },
}, { _id: false })

const aiMetadataSchema = new Schema({
  similarityChecked: { type: Boolean, default: false },
  suggestedMatches: [{ type: Types.ObjectId, ref: 'items' }],
}, { _id: false })

const itemSchema = new Schema({
  trackingId: { type: String, required: true },
  submissionType: { type: String, required: true, enum: ['lost', 'found'] },
  submittedBy: { type: Types.ObjectId, ref: 'users' },
  isAnonymous: { type: Boolean, default: false },
  organizationId: { type: Types.ObjectId },
  authorizationProofId: { type: Types.ObjectId },
  itemAttributes: { type: itemAttributesSchema, required: true },
  images: [{ type: String }],
  location: { type: itemLocationSchema, required: true },
  timeMetadata: { type: itemTimeMetadataSchema, required: true },
  status: { type: String, required: true, enum: ['draft', 'submitted', 'matched', 'resolved', 'archived'] },
  aiMetadata: aiMetadataSchema,
}, { timestamps: true })

itemSchema.index({ trackingId: 1 }, { unique: true })
itemSchema.index({ 'itemAttributes.category': 1 })
itemSchema.index({ location: '2dsphere' })

export type Item = InferSchemaType<typeof itemSchema>
export const ItemModel = model('items', itemSchema)

// DRAFT SUBMISSIONS
const draftSubmissionSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  partialData: { type: Schema.Types.Mixed, required: true },
  lastSavedAt: { type: Date, required: true },
})

export type DraftSubmission = InferSchemaType<typeof draftSubmissionSchema>
export const DraftSubmissionModel = model('draft_submissions', draftSubmissionSchema)
