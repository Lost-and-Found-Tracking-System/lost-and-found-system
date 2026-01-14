import { Schema, model, Types, InferSchemaType } from 'mongoose'

// NOTIFICATIONS
const notificationSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users' },
  type: { type: String, required: true, enum: ['match', 'status', 'proof_request', 'announcement'] },
  channel: { type: String, required: true, enum: ['email', 'push', 'sms'] },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, required: true },
  readAt: { type: Date },
})

notificationSchema.index({ userId: 1, sentAt: -1 })
notificationSchema.index({ isRead: 1 })

export type Notification = InferSchemaType<typeof notificationSchema>
export const NotificationModel = model('notifications', notificationSchema)

// NOTIFICATION PREFERENCES
const notificationPreferencesSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: 'users', unique: true },
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
