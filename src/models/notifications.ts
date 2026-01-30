import { Schema, model, Types, InferSchemaType } from 'mongoose'

// NOTIFICATIONS
const notificationSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  type: {
    type: String,
    required: true,
    enum: [
      'match',
      'status',
      'proof_request',
      'announcement',
      'item_match_found',
      'claim_submitted',
      'claim_approved',
      'claim_rejected',
      'item_claimed',
      'handover_scheduled',
      'reminder',
      'system_announcement',
      'security_alert'
    ]
  },
  channel: { type: String, enum: ['email', 'push', 'sms', 'in_app'], default: 'in_app' },
  title: { type: String },
  message: { type: String },
  content: { type: String }, // Deprecated, use message instead
  data: { type: Schema.Types.Mixed }, // Additional notification data
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

export type Notification = InferSchemaType<typeof notificationSchema>
export const NotificationModel = model('notifications', notificationSchema)

// NOTIFICATION PREFERENCES
const notificationPreferencesSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users', unique: true },
  // Channel preferences
  emailEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  pushEnabled: { type: Boolean, default: true },
  // Category preferences
  itemUpdates: { type: Boolean, default: true },
  claimUpdates: { type: Boolean, default: true },
  systemAnnouncements: { type: Boolean, default: true },
  // Quiet hours
  quietHoursStart: { type: String }, // HH:mm format
  quietHoursEnd: { type: String },
  // Legacy channels object (deprecated)
  channels: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  priorities: { type: Schema.Types.Mixed, default: {} },
})

notificationPreferencesSchema.index({ userId: 1 }, { unique: true })

export type NotificationPreferences = InferSchemaType<typeof notificationPreferencesSchema>
export const NotificationPreferencesModel = model('notification_preferences', notificationPreferencesSchema)

// ANNOUNCEMENTS
const announcementsSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRoles: [{ type: String, required: true }],
  targetZones: [{ type: Types.ObjectId, ref: 'campus_zones' }],
  createdBy: { type: Types.ObjectId, required: true, ref: 'users' },
  sentAt: { type: Date, required: true },
})

announcementsSchema.index({ sentAt: -1 })

export type Announcement = InferSchemaType<typeof announcementsSchema>
export const AnnouncementModel = model('announcements', announcementsSchema)

