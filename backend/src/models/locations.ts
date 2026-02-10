/**
 * @module models/locations
 * @description Mongoose schema for campus zone geospatial data.
 * Campus zones are polygonal areas used for item location tagging and zone-based filtering.
 */

import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// ─── CAMPUS ZONES ──────────────────────────────────────────────────────

/**
 * Campus zone schema — defines named geographic zones with GeoJSON Polygon boundaries.
 * Used for spatial queries and zone-based item filtering on the campus map.
 */
const campusZoneSchema = new Schema({
  zoneName: { type: String, required: true },
  geoBoundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[{ type: Number }]]],
      required: true,
    },
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Types.ObjectId, required: true, ref: 'users' },
  updatedAt: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } })

campusZoneSchema.index({ geoBoundary: '2dsphere' })

export type CampusZone = InferSchemaType<typeof campusZoneSchema>
export const CampusZoneModel = model('campus_zones', campusZoneSchema)
