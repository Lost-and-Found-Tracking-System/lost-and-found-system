import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

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

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>

// ============================================
// USER SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name required').optional(),
  phone: z.string().optional(),
  affiliation: z.string().optional(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>

export const updateNotificationPrefsSchema = z.object({
  channels: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
})
export type UpdateNotificationPrefsRequest = z.infer<typeof updateNotificationPrefsSchema>

// ============================================
// ITEM SCHEMAS
// ============================================

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
  organizationId: z.string().optional(),
})
export type SubmitItemRequest = z.infer<typeof submitItemSchema>

export const updateItemSchema = z.object({
  itemAttributes: itemAttributesSchema.optional(),
  location: locationSchema.optional(),
  status: z.enum(['draft', 'submitted', 'matched', 'resolved', 'archived']).optional(),
})
export type UpdateItemRequest = z.infer<typeof updateItemSchema>

export const searchItemsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  submissionType: z.enum(['lost', 'found']).optional(),
  status: z.string().optional(),
  zoneId: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  skip: z.coerce.number().min(0).default(0),
})
export type SearchItemsRequest = z.infer<typeof searchItemsSchema>

// ============================================
// CLAIM SCHEMAS
// ============================================

export const submitClaimSchema = z.object({
  itemId: z.string(),
  ownershipProofs: z.array(z.string()).min(1, 'At least one proof required'),
})
export type SubmitClaimRequest = z.infer<typeof submitClaimSchema>

export const claimDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  remarks: z.string().min(1, 'Remarks required'),
})
export type ClaimDecisionRequest = z.infer<typeof claimDecisionSchema>

// ============================================
// CAMPUS ZONE SCHEMAS
// ============================================

export const campusZoneSchema = z.object({
  zoneName: z.string().min(1, 'Zone name required'),
  geoBoundary: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
})
export type CampusZoneRequest = z.infer<typeof campusZoneSchema>

export const validateLocationSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
})
export type ValidateLocationRequest = z.infer<typeof validateLocationSchema>

// ============================================
// ADMIN SCHEMAS
// ============================================

export const updateRoleSchema = z.object({
  role: z.enum(['student', 'faculty', 'visitor', 'admin', 'delegated_admin']),
  reason: z.string().min(1, 'Reason required'),
})
export type UpdateRoleRequest = z.infer<typeof updateRoleSchema>

export const aiConfigSchema = z.object({
  thresholds: z.object({
    autoApprove: z.number().min(0).max(100),
    partialMatch: z.number().min(0).max(100),
  }),
  weights: z.object({
    text: z.number().min(0).max(100),
    image: z.number().min(0).max(100),
    location: z.number().min(0).max(100),
    time: z.number().min(0).max(100),
  }),
})
export type AiConfigRequest = z.infer<typeof aiConfigSchema>

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title required'),
  message: z.string().min(1, 'Message required'),
  targetRoles: z.array(z.string()).optional(),
  targetZones: z.array(z.string()).optional(),
})
export type AnnouncementRequest = z.infer<typeof announcementSchema>

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationPreferencesSchema = z.object({
  channels: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
})
export type NotificationPreferencesRequest = z.infer<typeof notificationPreferencesSchema>

// Note: updateProfileSchema is declared in USER SCHEMAS section above

// PASSWORD RESET SCHEMAS
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email'),
})

export type PasswordResetRequestRequest = z.infer<typeof passwordResetRequestSchema>

export const passwordResetVerifySchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export type PasswordResetVerifyRequest = z.infer<typeof passwordResetVerifySchema>

export const passwordResetCompleteSchema = z.object({
  email: z.string().email('Invalid email'),
  resetToken: z.string().min(1, 'Reset token required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type PasswordResetCompleteRequest = z.infer<typeof passwordResetCompleteSchema>

// VISITOR REGISTRATION SCHEMAS
export const visitorOtpRequestSchema = z.object({
  email: z.string().email('Invalid email'),
})

export type VisitorOtpRequestRequest = z.infer<typeof visitorOtpRequestSchema>

export const visitorRegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(1, 'Full name required'),
  phone: z.string().optional(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export type VisitorRegisterRequest = z.infer<typeof visitorRegisterSchema>

// ORGANIZATION SUBMISSION SCHEMAS
export const organizationSubmissionSchema = z.object({
  submissionType: z.enum(['lost', 'found']),
  itemAttributes: itemAttributesSchema,
  location: locationSchema,
  timeMetadata: timeMetadataSchema,
  isAnonymous: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  organizationId: z.string().min(1, 'Organization ID required'),
  authorizationProof: z.string().min(1, 'Authorization proof required'),
})

export type OrganizationSubmissionRequest = z.infer<typeof organizationSubmissionSchema>

// DRAFT SAVE SCHEMA
export const draftSaveSchema = z.object({
  submissionType: z.enum(['lost', 'found']).optional(),
  itemAttributes: z.object({
    category: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    size: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  location: z.object({
    type: z.literal('Point').optional(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
    zoneId: z.string().optional(),
  }).optional(),
  timeMetadata: z.object({
    lostOrFoundAt: z.coerce.date().optional(),
    reportedAt: z.coerce.date().optional(),
  }).optional(),
  isAnonymous: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

export type DraftSaveRequest = z.infer<typeof draftSaveSchema>

