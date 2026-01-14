import { ItemModel, DraftSubmissionModel } from '../models/index.js'
import crypto from 'crypto'
import { Types } from 'mongoose'

export interface SubmitItemInput {
  submissionType: 'lost' | 'found'
  itemAttributes: {
    category: string
    color?: string
    material?: string
    size?: string
    description: string
  }
  location: {
    type: 'Point'
    coordinates: [number, number]
    zoneId: string
  }
  timeMetadata: {
    lostOrFoundAt: Date
    reportedAt: Date
  }
  isAnonymous: boolean
  images?: string[]
  submittedBy?: string
}

export async function submitItem(input: SubmitItemInput) {
  const trackingId = `ITEM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`

  const item = new ItemModel({
    trackingId,
    submissionType: input.submissionType,
    submittedBy: input.submittedBy ? new Types.ObjectId(input.submittedBy) : undefined,
    isAnonymous: input.isAnonymous,
    itemAttributes: input.itemAttributes,
    location: {
      type: 'Point',
      coordinates: input.location.coordinates,
      zoneId: new Types.ObjectId(input.location.zoneId),
    },
    timeMetadata: input.timeMetadata,
    images: input.images || [],
    status: 'submitted',
    aiMetadata: {
      similarityChecked: false,
      suggestedMatches: [],
    },
  })

  await item.save()
  return item
}

export async function saveDraft(userId: string, partialData: Record<string, unknown>) {
  const draft = await DraftSubmissionModel.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    {
      userId: new Types.ObjectId(userId),
      partialData,
      lastSavedAt: new Date(),
    },
    { upsert: true, new: true },
  )
  return draft
}

export async function getDraft(userId: string) {
  return DraftSubmissionModel.findOne({ userId: new Types.ObjectId(userId) })
}

export async function getItemById(itemId: string) {
  return ItemModel.findById(itemId)
}

export async function getItemsByType(submissionType: 'lost' | 'found', limit = 20, skip = 0) {
  return ItemModel.find({ submissionType, status: { $in: ['submitted', 'matched'] } })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
}

export async function searchItems(query: Record<string, unknown>, limit = 20, skip = 0) {
  const filters: Record<string, unknown> = { status: { $in: ['submitted', 'matched'] } }

  if (query.category) {
    filters['itemAttributes.category'] = query.category
  }

  if (query.submissionType) {
    filters.submissionType = query.submissionType
  }

  if (query.description) {
    filters['itemAttributes.description'] = { $regex: query.description, $options: 'i' }
  }

  return ItemModel.find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
}
