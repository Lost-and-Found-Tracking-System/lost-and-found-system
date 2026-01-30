import { ItemModel, DraftSubmissionModel, CampusZoneModel } from '../models/index.js'
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

export interface OrganizationItemInput extends SubmitItemInput {
  organizationId: string
  authorizationProofUrl: string
}

export interface SearchFilters {
  q?: string
  category?: string
  submissionType?: 'lost' | 'found'
  status?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
  zoneId?: string
}

export interface SortOptions {
  field: string
  order: 1 | -1
}

export interface SearchResult {
  items: unknown[]
  total: number
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

export async function submitOrganizationItem(input: OrganizationItemInput) {
  const trackingId = `ITEM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`

  const item = new ItemModel({
    trackingId,
    submissionType: input.submissionType,
    submittedBy: input.submittedBy ? new Types.ObjectId(input.submittedBy) : undefined,
    isAnonymous: input.isAnonymous,
    organizationId: new Types.ObjectId(input.organizationId),
    authorizationProofId: input.authorizationProofUrl, // Store URL/ID reference
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

// ============ DRAFT MANAGEMENT ============

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

export async function deleteDraft(userId: string) {
  return DraftSubmissionModel.deleteOne({ userId: new Types.ObjectId(userId) })
}

// ============ ZONE VALIDATION ============

export async function validateZone(zoneId: string, coordinates: [number, number]): Promise<boolean> {
  try {
    // First check if zone exists
    const zone = await CampusZoneModel.findById(zoneId)
    if (!zone || !zone.isActive) {
      return false
    }

    // Check if coordinates are within zone boundary
    const pointInZone = await CampusZoneModel.findOne({
      _id: new Types.ObjectId(zoneId),
      isActive: true,
      geoBoundary: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
        },
      },
    })

    return pointInZone !== null
  } catch {
    // If zone validation fails (e.g., no zones configured), allow submission
    console.warn('Zone validation skipped - no zones configured or error occurred')
    return true
  }
}

// ============ ITEM RETRIEVAL ============

export async function getItemById(itemId: string) {
  return ItemModel.findById(itemId)
}

export async function getItemsByType(submissionType: 'lost' | 'found', limit = 20, skip = 0) {
  return ItemModel.find({ submissionType, status: { $in: ['submitted', 'matched'] } })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
}

// ============ ADVANCED SEARCH ============

export async function searchItems(
  filters: SearchFilters,
  limit = 20,
  skip = 0,
  sortOptions?: SortOptions,
  _userId?: string
): Promise<SearchResult> {
  const query: Record<string, unknown> = { status: { $in: ['submitted', 'matched'] } }

  // Full-text search on description
  if (filters.q) {
    query.$or = [
      { 'itemAttributes.description': { $regex: filters.q, $options: 'i' } },
      { 'itemAttributes.category': { $regex: filters.q, $options: 'i' } },
    ]
  }

  // Category filter
  if (filters.category) {
    query['itemAttributes.category'] = filters.category
  }

  // Submission type filter
  if (filters.submissionType) {
    query.submissionType = filters.submissionType
  }

  // Status filter
  if (filters.status) {
    query.status = filters.status
  }

  // Date range filter
  if (filters.dateRange) {
    const dateQuery: Record<string, Date> = {}
    if (filters.dateRange.from) {
      dateQuery.$gte = filters.dateRange.from
    }
    if (filters.dateRange.to) {
      dateQuery.$lte = filters.dateRange.to
    }
    if (Object.keys(dateQuery).length > 0) {
      query['timeMetadata.lostOrFoundAt'] = dateQuery
    }
  }

  // Zone filter
  if (filters.zoneId) {
    query['location.zoneId'] = new Types.ObjectId(filters.zoneId)
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {}
  if (sortOptions) {
    sort[sortOptions.field] = sortOptions.order
  } else {
    sort.createdAt = -1
  }

  // Execute queries
  const [items, total] = await Promise.all([
    ItemModel.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .populate('location.zoneId', 'zoneName'),
    ItemModel.countDocuments(query),
  ])

  return { items, total }
}

