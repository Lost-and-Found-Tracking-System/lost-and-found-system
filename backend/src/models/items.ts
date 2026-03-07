/**
 * @module models/items
 * @description Mongoose schemas for lost/found item management.
 * Includes: Items (with attributes, location, images, AI metadata) and Draft Submissions.
 */

import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// ─── ITEMS ─────────────────────────────────────────────────────────────

/** @internal Sub-schema for item physical attributes */
const itemAttributesSchema = new Schema({
  category: { type: String, required: true },
  color: { type: String },
  material: { type: String },
  size: { type: String },
  description: { type: String, required: true },
}, { _id: false })

/** @internal Sub-schema for GeoJSON Point location with campus zone reference */
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

/** @internal Sub-schema for item time metadata */
const itemTimeMetadataSchema = new Schema({
  lostOrFoundAt: { type: Date, required: true },
  reportedAt: { type: Date, required: true },
}, { _id: false })

/** @internal Sub-schema for AI similarity matching metadata */
const aiMetadataSchema = new Schema({
  similarityChecked: { type: Boolean, default: false },
  suggestedMatches: [{ type: Types.ObjectId, ref: 'items' }],
  /** YOLO-detected object labels (e.g. ['phone', 'bag']) */
  detectedObjects: [{ type: String }],
  /** Highest-confidence YOLO class label */
  primaryClass: { type: String },
  /** OpenCLIP image embedding vector */
  embedding: [{ type: Number }],
  /** TF-IDF text embedding vector */
  textEmbedding: [{ type: Number }],
}, { _id: false })

/**
 * Item schema — represents a lost or found item report.
 *
 * @property trackingId - Unique tracking identifier (e.g., `ITEM-1234`)
 * @property submissionType - Either `'lost'` or `'found'`
 * @property images - Array of Cloudinary image URLs
 * @property status - Lifecycle status: `draft`, `pending`, `submitted`, `matched`, `resolved`, `archived`, `rejected`
 * @property aiMetadata - AI-generated similarity match suggestions
 */
const itemSchema = new Schema({
  trackingId: { type: String, required: true },
  submissionType: { type: String, required: true, enum: ['lost', 'found'] },
  submittedBy: { type: Types.ObjectId, ref: 'users' },
  isAnonymous: { type: Boolean, default: false },
  organizationId: { type: Types.ObjectId },
  authorizationProofId: { type: Types.ObjectId },
  itemAttributes: { type: itemAttributesSchema, required: true },
  /** Array of Cloudinary image URLs for the item */
  images: [{ type: String }],
  location: { type: itemLocationSchema, required: true },
  timeMetadata: { type: itemTimeMetadataSchema, required: true },
  status: { type: String, required: true, enum: ['draft', 'pending', 'submitted', 'matched', 'resolved', 'archived', 'rejected'] },
  adminNotes: { type: String },
  reviewedBy: { type: Types.ObjectId, ref: 'users' },
  reviewedAt: { type: Date },
  aiMetadata: aiMetadataSchema,
}, { timestamps: true })

itemSchema.index({ trackingId: 1 }, { unique: true })
itemSchema.index({ 'itemAttributes.category': 1 })
itemSchema.index({ location: '2dsphere' })

/** Inferred TypeScript type for the Item document */
export type Item = InferSchemaType<typeof itemSchema>
/** Mongoose model for the `items` collection */
export const ItemModel = model('items', itemSchema)

// ─── DRAFT SUBMISSIONS ─────────────────────────────────────────────────

/**
 * Draft submission schema — stores partially completed item reports for later submission.
 */
const draftSubmissionSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  partialData: { type: Schema.Types.Mixed, required: true },
  lastSavedAt: { type: Date, required: true },
})

/** Inferred TypeScript type for the DraftSubmission document */
export type DraftSubmission = InferSchemaType<typeof draftSubmissionSchema>
/** Mongoose model for the `draft_submissions` collection */
export const DraftSubmissionModel = model('draft_submissions', draftSubmissionSchema)
