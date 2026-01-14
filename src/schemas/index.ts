import { z } from 'zod'

// AUTH SCHEMAS
export const registerSchema = z.object({
  institutionalId: z.string().optional(),
  email: z.string().email('Invalid email'),
  fullName: z.string().min(1, 'Full name required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  affiliation: z.string().optional(),
})

export type RegisterRequest = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export type LoginRequest = z.infer<typeof loginSchema>

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>

// ITEM SCHEMAS
export const itemAttributesSchema = z.object({
  category: z.string().min(1, 'Category required'),
  color: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
  zoneId: z.string(),
})

export const timeMetadataSchema = z.object({
  lostOrFoundAt: z.coerce.date(),
  reportedAt: z.coerce.date(),
})

export const submitItemSchema = z.object({
  submissionType: z.enum(['lost', 'found']),
  itemAttributes: itemAttributesSchema,
  location: locationSchema,
  timeMetadata: timeMetadataSchema,
  isAnonymous: z.boolean().default(false),
  images: z.array(z.string()).default([]),
})

export type SubmitItemRequest = z.infer<typeof submitItemSchema>

// CLAIM SCHEMAS
export const submitClaimSchema = z.object({
  itemId: z.string(),
  ownershipProofs: z.array(z.string()).min(1, 'At least one proof required'),
})

export type SubmitClaimRequest = z.infer<typeof submitClaimSchema>

// CAMPUS ZONE SCHEMAS
export const campusZoneSchema = z.object({
  zoneName: z.string().min(1, 'Zone name required'),
  geoBoundary: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
})

export type CampusZoneRequest = z.infer<typeof campusZoneSchema>

// NOTIFICATION PREFERENCES
export const notificationPreferencesSchema = z.object({
  channels: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
})

export type NotificationPreferencesRequest = z.infer<typeof notificationPreferencesSchema>
