import { Schema, model, Types } from 'mongoose'
import type { InferSchemaType } from 'mongoose'

// CAMPUS ZONES
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
