/**
 * AI Service for Lost & Found System
 *
 * Implements multi-model object detection using:
 * - HuggingFace YOLOv8 models (IndUSV/yoloV8_SE_3, IndUSV/Yolov8_Screen_Detection, IndUSV/computerApparatus-detector)
 * - Roboflow API for stationery detection
 * - OpenCLIP for image embeddings
 * - FAISS for similarity search and reranking
 */

import { Types } from 'mongoose'
import { AiConfigurationModel, AiMatchModel, ItemModel } from '../models/index.js'
import {
    calculateHybridTextSimilarity,
    calculateTFIDFSimilarity,
    type ItemDocument as TextItemDocument,
} from './textSimilarityService.js'

// ============ TYPE DEFINITIONS ============

export interface DetectedObject {
    label: string
    confidence: number
    bbox: [number, number, number, number] // [x, y, width, height]
    model: string
}

export interface ObjectDetectionResult {
    imageUrl: string
    objects: DetectedObject[]
    processingTimeMs: number
}

export interface ImageEmbedding {
    itemId: string
    imageUrl: string
    embedding: number[]
    detectedObjects: string[]
}

export interface SimilarityResult {
    matchedItemId: string
    overallScore: number
    featureBreakdown: {
        text: number
        image: number
        location: number
        time: number
    }
    objectOverlap: number
    explanation: string
}

export interface MatchResult {
    matchId: string
    lostItem: unknown
    foundItem: unknown
    similarityScore: number
    featureBreakdown: {
        text: number
        image: number
        location: number
        time: number
    }
    explanation: string
    confidenceLevel: 'high' | 'medium' | 'low'
}

export interface FeatureBreakdown {
    text: number
    image: number
    location: number
    time: number
}

interface ItemDocument {
    _id: Types.ObjectId
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
        zoneId: Types.ObjectId
    }
    timeMetadata: {
        lostOrFoundAt: Date
        reportedAt: Date
    }
    images?: string[]
    aiMetadata?: {
        similarityChecked: boolean
        suggestedMatches: Types.ObjectId[]
        detectedObjects?: string[]
        embedding?: number[]
    }
}

// ============ CONFIGURATION ============

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

const ROBOFLOW_API_URL = 'https://serverless.roboflow.com/ai-gym/workflows/stationaryclassification'
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || 'VQa4xNRhy58apI1aMTvI'

// YOLOv8 Model configurations
const YOLO_MODELS = {
    personalItems: {
        modelId: 'IndUSV/yoloV8_SE_3',
        description: 'Mobile phones, suitcases, handbags',
        labels: ['phone', 'mobile_phone', 'suitcase', 'handbag', 'bag'],
    },
    electronics: {
        modelId: 'IndUSV/Yolov8_Screen_Detection',
        description: 'Electronic gadgets and screens',
        labels: ['screen', 'laptop', 'tablet', 'monitor', 'tv', 'display'],
    },
    computerApparatus: {
        modelId: 'IndUSV/computerApparatus-detector',
        description: 'Keyboard, mouse, monitor',
        labels: ['keyboard', 'mouse', 'monitor', 'computer'],
    },
}

// Default AI configuration weights
const DEFAULT_WEIGHTS = {
    text: 0.3,
    image: 0.35,
    location: 0.2,
    time: 0.15,
}

// ============ HUGGINGFACE YOLOV8 DETECTION ============

/**
 * Run object detection using a HuggingFace YOLOv8 model
 */
async function detectWithHuggingFaceModel(
    imageUrl: string,
    modelId: string
): Promise<DetectedObject[]> {
    try {
        // Fetch image as blob
        const imageResponse = await fetch(imageUrl)
        const imageBlob = await imageResponse.blob()
        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer())

        const response = await fetch(`${HUGGINGFACE_API_URL}/${modelId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/octet-stream',
            },
            body: imageBuffer,
        })

        if (!response.ok) {
            console.error(`HuggingFace API error for ${modelId}: ${response.statusText}`)
            return []
        }

        const results = (await response.json()) as Array<{
            label: string
            score: number
            box: { xmin: number; ymin: number; xmax: number; ymax: number }
        }>

        return results.map((r) => ({
            label: r.label.toLowerCase(),
            confidence: r.score,
            bbox: [r.box.xmin, r.box.ymin, r.box.xmax - r.box.xmin, r.box.ymax - r.box.ymin] as [
                number,
                number,
                number,
                number,
            ],
            model: modelId,
        }))
    } catch (error) {
        console.error(`Error with HuggingFace model ${modelId}:`, error)
        return []
    }
}

/**
 * Run stationery detection using Roboflow API
 */
async function detectStationery(imageUrl: string): Promise<DetectedObject[]> {
    try {
        const response = await fetch(ROBOFLOW_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: ROBOFLOW_API_KEY,
                inputs: {
                    image: { type: 'url', value: imageUrl },
                },
            }),
        })

        if (!response.ok) {
            console.error(`Roboflow API error: ${response.statusText}`)
            return []
        }

        const result = (await response.json()) as {
            outputs?: Array<{
                predictions?: Array<{
                    class: string
                    confidence: number
                    x: number
                    y: number
                    width: number
                    height: number
                }>
            }>
        }

        const predictions = result.outputs?.[0]?.predictions || []

        return predictions.map((p) => ({
            label: p.class.toLowerCase(),
            confidence: p.confidence,
            bbox: [p.x - p.width / 2, p.y - p.height / 2, p.width, p.height] as [
                number,
                number,
                number,
                number,
            ],
            model: 'roboflow-stationery',
        }))
    } catch (error) {
        console.error('Error with Roboflow stationery detection:', error)
        return []
    }
}

/**
 * Run all YOLOv8 models on an image and aggregate results
 */
export async function detectObjectsInImage(imageUrl: string): Promise<ObjectDetectionResult> {
    const startTime = Date.now()

    // Run all models in parallel
    const [personalItems, electronics, computerApparatus, stationery] = await Promise.all([
        detectWithHuggingFaceModel(imageUrl, YOLO_MODELS.personalItems.modelId),
        detectWithHuggingFaceModel(imageUrl, YOLO_MODELS.electronics.modelId),
        detectWithHuggingFaceModel(imageUrl, YOLO_MODELS.computerApparatus.modelId),
        detectStationery(imageUrl),
    ])

    // Aggregate all detections
    const allObjects = [...personalItems, ...electronics, ...computerApparatus, ...stationery]

    // Deduplicate overlapping detections (same object detected by multiple models)
    const deduplicatedObjects = deduplicateDetections(allObjects)

    return {
        imageUrl,
        objects: deduplicatedObjects,
        processingTimeMs: Date.now() - startTime,
    }
}

/**
 * Deduplicate overlapping detections using Non-Maximum Suppression (NMS)
 */
function deduplicateDetections(objects: DetectedObject[], iouThreshold = 0.5): DetectedObject[] {
    if (objects.length === 0) return []

    // Sort by confidence descending
    const sorted = [...objects].sort((a, b) => b.confidence - a.confidence)
    const kept: DetectedObject[] = []

    for (const obj of sorted) {
        let shouldKeep = true

        for (const existing of kept) {
            const iou = calculateIoU(obj.bbox, existing.bbox)
            // If high overlap and similar label, skip this detection
            if (iou > iouThreshold && areSimilarLabels(obj.label, existing.label)) {
                shouldKeep = false
                break
            }
        }

        if (shouldKeep) {
            kept.push(obj)
        }
    }

    return kept
}

/**
 * Calculate Intersection over Union (IoU) for two bounding boxes
 */
function calculateIoU(
    bbox1: [number, number, number, number],
    bbox2: [number, number, number, number]
): number {
    const [x1, y1, w1, h1] = bbox1
    const [x2, y2, w2, h2] = bbox2

    const xA = Math.max(x1, x2)
    const yA = Math.max(y1, y2)
    const xB = Math.min(x1 + w1, x2 + w2)
    const yB = Math.min(y1 + h1, y2 + h2)

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA)
    const boxAArea = w1 * h1
    const boxBArea = w2 * h2
    const unionArea = boxAArea + boxBArea - interArea

    return unionArea > 0 ? interArea / unionArea : 0
}

/**
 * Check if two labels refer to similar objects
 */
function areSimilarLabels(label1: string, label2: string): boolean {
    const synonyms: Record<string, string[]> = {
        phone: ['mobile_phone', 'smartphone', 'cellphone'],
        laptop: ['notebook', 'computer'],
        bag: ['handbag', 'backpack', 'suitcase', 'luggage'],
        monitor: ['screen', 'display', 'tv'],
    }

    if (label1 === label2) return true

    for (const [_key, group] of Object.entries(synonyms)) {
        if (group.includes(label1) && group.includes(label2)) return true
        if (group.includes(label1) && label2 === _key) return true
        if (group.includes(label2) && label1 === _key) return true
    }

    return false
}

// ============ OPENCLIP EMBEDDINGS ============

/**
 * Generate image embedding using OpenCLIP via HuggingFace
 */
async function generateOpenClipEmbedding(imageUrl: string): Promise<number[]> {
    try {
        // Using OpenCLIP model via HuggingFace feature extraction
        const imageResponse = await fetch(imageUrl)
        const imageBlob = await imageResponse.blob()
        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer())

        const response = await fetch(`${HUGGINGFACE_API_URL}/laion/CLIP-ViT-B-32-laion2B-s34B-b79K`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/octet-stream',
            },
            body: imageBuffer,
        })

        if (!response.ok) {
            console.error(`OpenCLIP embedding error: ${response.statusText}`)
            return []
        }

        const embedding = (await response.json()) as number[]
        return embedding
    } catch (error) {
        console.error('Error generating OpenCLIP embedding:', error)
        return []
    }
}

// ============ FAISS-BASED SIMILARITY ============

/**
 * In-memory FAISS-like index for embeddings
 * Using cosine similarity for vector comparison
 */
class FAISSIndex {
    private embeddings: Map<string, { embedding: number[]; metadata: { objects: string[] } }> =
        new Map()

    /**
     * Add an embedding to the index
     */
    add(id: string, embedding: number[], metadata: { objects: string[] }): void {
        this.embeddings.set(id, { embedding, metadata })
    }

    /**
     * Search for similar embeddings
     */
    search(
        queryEmbedding: number[],
        k: number = 10
    ): Array<{ id: string; similarity: number; metadata: { objects: string[] } }> {
        const results: Array<{ id: string; similarity: number; metadata: { objects: string[] } }> = []

        for (const [id, data] of this.embeddings) {
            const similarity = this.cosineSimilarity(queryEmbedding, data.embedding)
            results.push({ id, similarity, metadata: data.metadata })
        }

        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity)

        return results.slice(0, k)
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length || vec1.length === 0) return 0

        let dotProduct = 0
        let norm1 = 0
        let norm2 = 0

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i]
            norm1 += vec1[i] * vec1[i]
            norm2 += vec2[i] * vec2[i]
        }

        const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
        return magnitude > 0 ? dotProduct / magnitude : 0
    }

    /**
     * Remove an embedding from the index
     */
    remove(id: string): void {
        this.embeddings.delete(id)
    }

    /**
     * Get all embeddings
     */
    getAll(): Map<string, { embedding: number[]; metadata: { objects: string[] } }> {
        return this.embeddings
    }

    /**
     * Clear the index
     */
    clear(): void {
        this.embeddings.clear()
    }
}

// Global FAISS index instance
const faissIndex = new FAISSIndex()

// ============ IMAGE GROUPING ============

/**
 * Calculate object list overlap between two items
 */
function calculateObjectOverlap(objects1: string[], objects2: string[]): number {
    if (objects1.length === 0 || objects2.length === 0) return 0

    const set1 = new Set(objects1.map((o) => o.toLowerCase()))
    const set2 = new Set(objects2.map((o) => o.toLowerCase()))

    let intersection = 0
    for (const obj of set1) {
        if (set2.has(obj)) intersection++
    }

    // Jaccard similarity
    const union = new Set([...set1, ...set2]).size
    return union > 0 ? (intersection / union) * 100 : 0
}

/**
 * Group images based on detected object similarity
 */
export async function groupImagesByObjects(
    imageUrls: string[]
): Promise<Map<string, { images: string[]; objects: string[] }>> {
    const groups = new Map<string, { images: string[]; objects: string[] }>()
    const imageObjects = new Map<string, string[]>()

    // Detect objects in all images
    for (const url of imageUrls) {
        const result = await detectObjectsInImage(url)
        const objectLabels = result.objects.map((o) => o.label)
        imageObjects.set(url, objectLabels)
    }

    // Group by object similarity
    let groupId = 0
    const assigned = new Set<string>()

    for (const [url, objects] of imageObjects) {
        if (assigned.has(url)) continue

        const currentGroup = { images: [url], objects: [...objects] }
        assigned.add(url)

        // Find similar images
        for (const [otherUrl, otherObjects] of imageObjects) {
            if (assigned.has(otherUrl)) continue

            const overlap = calculateObjectOverlap(objects, otherObjects)
            if (overlap >= 50) {
                // 50% overlap threshold
                currentGroup.images.push(otherUrl)
                // Merge object lists
                for (const obj of otherObjects) {
                    if (!currentGroup.objects.includes(obj)) {
                        currentGroup.objects.push(obj)
                    }
                }
                assigned.add(otherUrl)
            }
        }

        groups.set(`group_${groupId++}`, currentGroup)
    }

    return groups
}

// ============ LOCATION SIMILARITY ============

/**
 * Calculate Haversine distance between two coordinates
 */
function haversineDistance(
    coords1: [number, number],
    coords2: [number, number]
): number {
    const [lon1, lat1] = coords1
    const [lon2, lat2] = coords2

    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * Calculate location-based similarity score
 */
function calculateLocationScore(
    coords1: [number, number],
    coords2: [number, number]
): number {
    const distanceKm = haversineDistance(coords1, coords2)

    if (distanceKm < 0.1) return 100 // Same building (~100m)
    if (distanceKm < 0.5) return 80 // Same campus area
    if (distanceKm < 1.0) return 50 // Same campus
    if (distanceKm < 5.0) return 20 // Nearby
    return 0
}

// ============ TIME SIMILARITY ============

/**
 * Calculate time-based similarity score
 */
function calculateTimeScore(
    item1: ItemDocument,
    item2: ItemDocument
): number {
    const time1 = new Date(item1.timeMetadata.lostOrFoundAt).getTime()
    const time2 = new Date(item2.timeMetadata.lostOrFoundAt).getTime()
    const hoursDiff = Math.abs(time1 - time2) / (1000 * 60 * 60)

    // Found item should be AFTER lost item
    if (item1.submissionType === 'lost' && item2.submissionType === 'found') {
        if (time2 < time1) {
            return 0 // Found before lost - impossible
        }
    }

    if (hoursDiff < 24) return 100 // Same day
    if (hoursDiff < 72) return 70 // Within 3 days
    if (hoursDiff < 168) return 40 // Within a week
    if (hoursDiff < 720) return 20 // Within a month
    return 5 // Old but still possible
}

// ============ TEXT SIMILARITY ============

/**
 * Calculate text similarity using hybrid TF-IDF + embeddings approach
 * Uses textSimilarityService for the actual calculation
 */
async function calculateTextScore(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<number> {
    // Convert to compatible type for textSimilarityService
    const textItem1: TextItemDocument = {
        _id: item1._id,
        submissionType: item1.submissionType,
        itemAttributes: item1.itemAttributes,
    }
    const textItem2: TextItemDocument = {
        _id: item2._id,
        submissionType: item2.submissionType,
        itemAttributes: item2.itemAttributes,
    }

    // Use hybrid TF-IDF + embedding similarity
    const result = await calculateHybridTextSimilarity(textItem1, textItem2)
    return result.finalScore
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length || vec1.length === 0) return 0

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i]
        norm1 += vec1[i] * vec1[i]
        norm2 += vec2[i] * vec2[i]
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    return magnitude > 0 ? dotProduct / magnitude : 0
}

// ============ IMAGE SIMILARITY ============

/**
 * Calculate image similarity using OpenCLIP + FAISS
 */
async function calculateImageScore(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<{ score: number; objectOverlap: number }> {
    // If no images, return 0
    if (!item1.images?.length || !item2.images?.length) {
        return { score: 0, objectOverlap: 0 }
    }

    // Get or compute embeddings and detected objects
    const [item1Data, item2Data] = await Promise.all([
        getItemImageData(item1),
        getItemImageData(item2),
    ])

    // Calculate object overlap
    const objectOverlap = calculateObjectOverlap(item1Data.objects, item2Data.objects)

    // Calculate embedding similarity using FAISS
    if (item1Data.embedding.length > 0 && item2Data.embedding.length > 0) {
        const embeddingSimilarity = cosineSimilarity(item1Data.embedding, item2Data.embedding)

        // Weighted combination: 60% embedding similarity, 40% object overlap
        const score = Math.round(embeddingSimilarity * 60 + objectOverlap * 0.4)
        return { score: Math.min(100, score), objectOverlap }
    }

    // Fallback to object overlap only
    return { score: Math.round(objectOverlap), objectOverlap }
}

/**
 * Get or compute image data (embedding + detected objects) for an item
 */
async function getItemImageData(
    item: ItemDocument
): Promise<{ embedding: number[]; objects: string[] }> {
    // Check if already computed
    if (item.aiMetadata?.embedding && item.aiMetadata?.detectedObjects) {
        return {
            embedding: item.aiMetadata.embedding,
            objects: item.aiMetadata.detectedObjects,
        }
    }

    // Compute for first image (could be extended to all images)
    const imageUrl = item.images?.[0]
    if (!imageUrl) {
        return { embedding: [], objects: [] }
    }

    // Run detection and embedding in parallel
    const [detection, embedding] = await Promise.all([
        detectObjectsInImage(imageUrl),
        generateOpenClipEmbedding(imageUrl),
    ])

    const objects = detection.objects.map((o) => o.label)

    // Update item's AI metadata (cache for future use)
    await ItemModel.findByIdAndUpdate(item._id, {
        $set: {
            'aiMetadata.embedding': embedding,
            'aiMetadata.detectedObjects': objects,
        },
    })

    // Add to FAISS index
    if (embedding.length > 0) {
        faissIndex.add(item._id.toString(), embedding, { objects })
    }

    return { embedding, objects }
}

// ============ MATCH EXPLAINABILITY ============

/**
 * Generate human-readable explanation for a match
 */
function generateMatchExplanation(
    item1: ItemDocument,
    item2: ItemDocument,
    scores: FeatureBreakdown,
    objectOverlap: number
): string {
    const parts: string[] = []

    if (scores.text > 70) {
        parts.push(`Descriptions are ${scores.text}% similar`)
    }

    if (item1.itemAttributes.category === item2.itemAttributes.category) {
        parts.push(`Both are in category "${item1.itemAttributes.category}"`)
    }

    if (scores.location > 80) {
        parts.push('Found in the same area')
    }

    if (scores.time > 70) {
        parts.push('Found around the same time as reported lost')
    }

    if (item1.itemAttributes.color && item1.itemAttributes.color === item2.itemAttributes.color) {
        parts.push(`Both described as ${item1.itemAttributes.color}`)
    }

    if (objectOverlap > 50) {
        parts.push(`Detected similar objects in images (${Math.round(objectOverlap)}% overlap)`)
    }

    if (scores.image > 70) {
        parts.push(`Images are visually similar (${scores.image}%)`)
    }

    return parts.length > 0 ? parts.join('. ') + '.' : 'No specific matching factors identified.'
}

// ============ CORE MATCHING FUNCTIONS ============

/**
 * Get AI configuration (weights and thresholds)
 */
async function getAiConfiguration(): Promise<{
    weights: typeof DEFAULT_WEIGHTS
    thresholds: { autoApprove: number; partialMatch: number }
}> {
    const config = await AiConfigurationModel.findOne({ enabled: true }).sort({ version: -1 })

    if (config) {
        return {
            weights: config.weights as typeof DEFAULT_WEIGHTS,
            thresholds: config.thresholds as { autoApprove: number; partialMatch: number },
        }
    }

    return {
        weights: DEFAULT_WEIGHTS,
        thresholds: { autoApprove: 85, partialMatch: 50 },
    }
}

/**
 * Calculate overall similarity between two items
 */
export async function calculateItemSimilarity(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<{
    overallScore: number
    featureBreakdown: FeatureBreakdown
    objectOverlap: number
    explanation: string
}> {
    const config = await getAiConfiguration()

    // Calculate individual scores
    const [textScore, imageData] = await Promise.all([
        calculateTextScore(item1, item2),
        calculateImageScore(item1, item2),
    ])

    const locationScore = calculateLocationScore(
        item1.location.coordinates,
        item2.location.coordinates
    )

    const timeScore = calculateTimeScore(item1, item2)

    const featureBreakdown: FeatureBreakdown = {
        text: textScore,
        image: imageData.score,
        location: locationScore,
        time: timeScore,
    }

    // Weighted overall score
    const overallScore = Math.round(
        featureBreakdown.text * config.weights.text +
        featureBreakdown.image * config.weights.image +
        featureBreakdown.location * config.weights.location +
        featureBreakdown.time * config.weights.time
    )

    const explanation = generateMatchExplanation(
        item1,
        item2,
        featureBreakdown,
        imageData.objectOverlap
    )

    return {
        overallScore,
        featureBreakdown,
        objectOverlap: imageData.objectOverlap,
        explanation,
    }
}

/**
 * Find similar items for a given item
 */
export async function findSimilarItems(
    itemId: string,
    submissionType: 'lost' | 'found'
): Promise<SimilarityResult[]> {
    const item = (await ItemModel.findById(itemId)) as ItemDocument | null
    if (!item) {
        throw new Error(`Item not found: ${itemId}`)
    }

    // Find opposite type items to compare
    const oppositeType = submissionType === 'lost' ? 'found' : 'lost'
    const candidateItems = (await ItemModel.find({
        submissionType: oppositeType,
        status: { $in: ['submitted', 'matched'] },
        // Filter by same category if possible
        'itemAttributes.category': item.itemAttributes.category,
    }).limit(100)) as unknown as ItemDocument[]

    // Calculate similarity for each candidate
    const results: SimilarityResult[] = []

    for (const candidate of candidateItems) {
        const similarity = await calculateItemSimilarity(item, candidate)

        // Only include if score above threshold
        if (similarity.overallScore >= 30) {
            results.push({
                matchedItemId: candidate._id.toString(),
                overallScore: similarity.overallScore,
                featureBreakdown: similarity.featureBreakdown,
                objectOverlap: similarity.objectOverlap,
                explanation: similarity.explanation,
            })
        }
    }

    // Sort by score descending
    results.sort((a, b) => b.overallScore - a.overallScore)

    // Update item's AI metadata
    await ItemModel.findByIdAndUpdate(itemId, {
        $set: {
            'aiMetadata.similarityChecked': true,
            'aiMetadata.suggestedMatches': results.slice(0, 10).map((r) => new Types.ObjectId(r.matchedItemId)),
        },
    })

    return results
}

/**
 * Get top N matches for an item
 */
export async function getTopMatches(
    itemId: string,
    limit: number = 10
): Promise<MatchResult[]> {
    const item = (await ItemModel.findById(itemId).populate(
        'location.zoneId',
        'zoneName'
    )) as ItemDocument | null

    if (!item) {
        throw new Error(`Item not found: ${itemId}`)
    }

    // Check if we have cached suggested matches
    if (item.aiMetadata?.suggestedMatches?.length) {
        const matchedItems = await ItemModel.find({
            _id: { $in: item.aiMetadata.suggestedMatches },
        }).populate('location.zoneId', 'zoneName')

        const results: MatchResult[] = []

        for (const matchedItem of matchedItems) {
            const similarity = await calculateItemSimilarity(
                item,
                matchedItem as unknown as ItemDocument
            )

            const confidenceLevel: 'high' | 'medium' | 'low' =
                similarity.overallScore >= 80
                    ? 'high'
                    : similarity.overallScore >= 50
                        ? 'medium'
                        : 'low'

            // Check if match already exists in database
            let matchId: string
            const existingMatch = await AiMatchModel.findOne({
                $or: [
                    { lostItemId: item._id, foundItemId: matchedItem._id },
                    { lostItemId: matchedItem._id, foundItemId: item._id },
                ],
            })

            if (existingMatch) {
                matchId = existingMatch._id.toString()
            } else {
                // Create new AI match record
                const lostItemId =
                    item.submissionType === 'lost' ? item._id : matchedItem._id
                const foundItemId =
                    item.submissionType === 'found' ? item._id : matchedItem._id

                const newMatch = new AiMatchModel({
                    lostItemId,
                    foundItemId,
                    similarityScore: similarity.overallScore,
                    featureBreakdown: similarity.featureBreakdown,
                    status: 'pending' as never, // Status will be updated by admin
                    generatedAt: new Date(),
                })

                await newMatch.save()
                matchId = newMatch._id.toString()
            }

            results.push({
                matchId,
                lostItem: item.submissionType === 'lost' ? item : matchedItem,
                foundItem: item.submissionType === 'found' ? item : matchedItem,
                similarityScore: similarity.overallScore,
                featureBreakdown: similarity.featureBreakdown,
                explanation: similarity.explanation,
                confidenceLevel,
            })
        }

        return results.slice(0, limit)
    }

    // No cached matches, run fresh similarity search
    const similarResults = await findSimilarItems(itemId, item.submissionType)

    const results: MatchResult[] = []

    for (const result of similarResults.slice(0, limit)) {
        const matchedItem = await ItemModel.findById(result.matchedItemId).populate(
            'location.zoneId',
            'zoneName'
        )

        if (!matchedItem) continue

        const confidenceLevel: 'high' | 'medium' | 'low' =
            result.overallScore >= 80 ? 'high' : result.overallScore >= 50 ? 'medium' : 'low'

        // Create AI match record
        const lostItemId =
            item.submissionType === 'lost' ? item._id : matchedItem._id
        const foundItemId =
            item.submissionType === 'found' ? item._id : matchedItem._id

        const newMatch = new AiMatchModel({
            lostItemId,
            foundItemId,
            similarityScore: result.overallScore,
            featureBreakdown: result.featureBreakdown,
            status: 'pending' as never,
            generatedAt: new Date(),
        })

        await newMatch.save()

        results.push({
            matchId: newMatch._id.toString(),
            lostItem: item.submissionType === 'lost' ? item : matchedItem,
            foundItem: item.submissionType === 'found' ? item : matchedItem,
            similarityScore: result.overallScore,
            featureBreakdown: result.featureBreakdown,
            explanation: result.explanation,
            confidenceLevel,
        })
    }

    return results
}

/**
 * Process admin decision on a match
 */
export async function processMatchDecision(
    matchId: string,
    decision: 'accepted' | 'rejected',
    adminId: string,
    reason?: string
): Promise<void> {
    const match = await AiMatchModel.findById(matchId)
    if (!match) {
        throw new Error(`Match not found: ${matchId}`)
    }

    // Update match status
    await AiMatchModel.findByIdAndUpdate(matchId, {
        status: decision,
    })

    // If accepted, update both items to 'matched' status
    if (decision === 'accepted') {
        await Promise.all([
            ItemModel.findByIdAndUpdate(match.lostItemId, { status: 'matched' }),
            ItemModel.findByIdAndUpdate(match.foundItemId, { status: 'matched' }),
        ])
    }

    // Log the decision for analytics
    console.log(
        `Match ${matchId} ${decision} by admin ${adminId}${reason ? `: ${reason}` : ''}`
    )
}

// ============ QUICK MATCH FOR REAL-TIME SUGGESTIONS ============

/**
 * Find quick matches during item submission (text-based only)
 */
export async function findQuickMatches(params: {
    category: string
    description: string
    zoneId?: string
    limit?: number
}): Promise<
    Array<{
        itemId: string
        trackingId: string
        description: string
        similarityScore: number
        submittedAt: Date
    }>
> {
    const { category, description, zoneId, limit = 5 } = params

    // Build query
    const query: Record<string, unknown> = {
        'itemAttributes.category': category,
        status: { $in: ['submitted', 'matched'] },
    }

    if (zoneId) {
        query['location.zoneId'] = new Types.ObjectId(zoneId)
    }

    const candidates = await ItemModel.find(query)
        .select('trackingId itemAttributes.description createdAt')
        .limit(50)
        .sort({ createdAt: -1 })

    // Simple text similarity scoring
    const results = candidates.map((candidate: { _id: unknown; trackingId: unknown; itemAttributes: { description: unknown }; createdAt: unknown }) => {
        const candidateDesc = String(candidate.itemAttributes.description || '')
        const score = calculateTFIDFSimilarity(description, candidateDesc)

        return {
            itemId: String(candidate._id),
            trackingId: String(candidate.trackingId),
            description: candidateDesc,
            similarityScore: score,
            submittedAt: candidate.createdAt as Date,
        }
    })

    // Sort by score and return top results
    return results.sort((a: { similarityScore: number }, b: { similarityScore: number }) => b.similarityScore - a.similarityScore).slice(0, limit)
}

// ============ BATCH PROCESSING ============

/**
 * Process all unprocessed items for AI matching
 */
export async function batchProcessItems(): Promise<{
    processed: number
    matches: number
    errors: number
}> {
    const unprocessedItems = await ItemModel.find({
        'aiMetadata.similarityChecked': { $ne: true },
        status: 'submitted',
    }).limit(100)

    let processed = 0
    let matches = 0
    let errors = 0

    for (const item of unprocessedItems) {
        try {
            const results = await findSimilarItems(
                item._id.toString(),
                item.submissionType
            )
            processed++
            matches += results.filter((r) => r.overallScore >= 50).length
        } catch (error) {
            console.error(`Error processing item ${item._id}:`, error)
            errors++
        }
    }

    return { processed, matches, errors }
}

/**
 * Rebuild FAISS index from database
 */
export async function rebuildFaissIndex(): Promise<{ indexed: number }> {
    faissIndex.clear()

    const items = await ItemModel.find({
        'aiMetadata.embedding': { $exists: true, $ne: [] },
    }).select('_id aiMetadata.embedding aiMetadata.detectedObjects') as unknown as Array<{
        _id: Types.ObjectId
        aiMetadata?: {
            embedding?: number[]
            detectedObjects?: string[]
        }
    }>

    for (const item of items) {
        if (item.aiMetadata?.embedding && item.aiMetadata.embedding.length > 0) {
            faissIndex.add(item._id.toString(), item.aiMetadata.embedding, {
                objects: item.aiMetadata.detectedObjects || [],
            })
        }
    }

    return { indexed: items.length }
}

// ============ EXPORTS ============

export {
    calculateLocationScore,
    calculateTimeScore, DEFAULT_WEIGHTS, faissIndex, generateMatchExplanation, YOLO_MODELS
}

