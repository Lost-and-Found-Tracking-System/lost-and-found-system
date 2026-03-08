/**
 * Embedding Service for Lost & Found System
 *
 * Implements a three-tier semantic processing pipeline for images:
 * 1. YOLO-based object detection (4 models in parallel)
 * 2. OpenCLIP image embeddings
 * 3. TF-IDF text embeddings
 *
 * YOLOv8 Models:
 * - IndUSV/yoloV8_SE_3: Mobile phones, suitcases, handbags
 * - IndUSV/Yolov8_Screen_Detection: Electronic gadgets and screens
 * - IndUSV/computerApparatus-detector: Keyboard, mouse, monitor
 * - Roboflow API: Stationery detection
 */

import { execFile } from 'child_process'
import { Types } from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { AiConfigurationModel, AiMatchModel, ItemEmbeddingModel, ItemModel } from '../models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Python interpreter that has groq + transformers + sentence_transformers installed
const PYTHON_BIN = '/opt/miniconda3/envs/lightenv/bin/python3'

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
    primaryClass: string | null
}

export interface ImageEmbedding {
    itemId: string
    imageUrl: string
    embedding: number[]
    detectedObjects: string[]
}

export interface TextEmbedding {
    itemId: string
    description: string
    embedding: number[]
    vocabulary: string[]
}

export interface ProcessingResult {
    itemId: string
    yoloResult: ObjectDetectionResult
    imageEmbedding: number[]
    textEmbedding: number[]
    hybridEmbedding: number[]
    savedToDatabase: boolean
    processingTimeMs: number
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
        textEmbedding?: number[]
        primaryClass?: string
    }
}

// ============ CONFIGURATION ============

const HUGGINGFACE_API_URL = 'https://router.huggingface.co/hf-inference/models'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// YOLOv8 Model configurations
const YOLO_MODELS = {
    personalItems: {
        modelId: 'IndUSV/yoloV8_SE_3',
        weightUrl: 'https://huggingface.co/IndUSV/yoloV8_SE_3/resolve/main/Yolov8_SE_3.pt',
        description: 'Mobile phones, suitcases, handbags',
        labels: ['mobile_phone', 'suitcase', 'handbag'],
    },
    phone: {
        modelId: 'IndUSV/yolov8n-mobile-phone',
        weightUrl: 'https://huggingface.co/IndUSV/yolov8n-mobile-phone/resolve/main/yolov8n-mobile-phone.pt',
        description: 'Mobile Phone',
        labels: ['mobile_phone']
    },
    electronics: {
        modelId: 'IndUSV/Yolov8_Screen_Detection',
        weightUrl: 'https://huggingface.co/IndUSV/Yolov8_Screen_Detection/resolve/main/best.pt',
        description: 'Electronic gadgets and screens',
        labels: ['laptop', 'phone', 'monitor', 'keyboard', 'mouse', 'screen', 'electronics'],
    },
    computerApparatus: {
        modelId: 'IndUSV/computerApparatus-detector',
        weightUrl: 'https://huggingface.co/IndUSV/computerApparatus-detector/resolve/main/yolov8n_best.pt',
        description: 'Keyboard, mouse, monitor',
        labels: ['keyboard', 'mouse', 'monitor'],
    },
    phoneAndSuitcase: {
        modelId: 'IndUSV/yolov8_SE_2',
        weightUrl: 'https://huggingface.co/IndUSV/yolov8_SE_2/resolve/main/Yolov8_SE_2.pt',
        description: 'Mobile phones, suitcases',
        labels: ['mobile_phone', 'suitcase'],
    },
}


export interface ImageDuplicateCheckResult {
    /** Whether more than one object of the SAME semantic class was found */
    hasDuplicates: boolean
    /** The class label that appears multiple times (if any) */
    duplicateClass: string | null
    /** How many of that class were detected */
    duplicateCount: number
    /** All detected objects (label + confidence) */
    detectedObjects: Array<{ label: string; confidence: number }>
    /** Labels that semantically matched the item title (with their scores) */
    matchedLabels: Array<{ label: string; similarity: number }>
    /** Frequency map of normalized labels found in the image */
    labelCounts: Record<string, number>
    /** Human-readable warning, or null if no issue */
    warning: string | null
    /** Whether the image appears to contain the reported item type at all */
    itemDetected: boolean
}

// Default AI configuration weights
const DEFAULT_WEIGHTS = {
    text: 0.3,
    image: 0.35,
    location: 0.2,
    time: 0.15,
}

// TF-IDF Stop words
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
    'whom', 'this', 'that', 'these', 'those', 'am', 'been', 'being', 'have',
    'having', 'doing', 'would', 'could', 'should', 'might', 'must', 'just',
    'very', 'also', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'now', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'under', 'again', 'further', 'then', 'once', 'up', 'down', 'out', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'lost', 'found',
    'item', 'please', 'help', 'looking', 'find'
])

// ============ FUNCTION 1: YOLO OBJECT DETECTION ============

async function detectWithYoloPython(
    imageUrl: string,
    modelUrl: string,
    modelId: string,
    conf: number = 0.25
): Promise<DetectedObject[]> {
    return new Promise((resolve) => {
        const pythonScriptPath = path.join(__dirname, 'yolo_service.py')

        // Map URL to local path if needed
        let localPathOrUrl = imageUrl;
        if (localPathOrUrl && (localPathOrUrl.includes('localhost:3000/uploads/') || localPathOrUrl.includes('localhost:5000/uploads/'))) {
            const filename = localPathOrUrl.split('/uploads/').pop();
            if (filename) {
                localPathOrUrl = path.resolve(__dirname, '../../uploads', filename);
            }
        }

        console.log(`[YOLO DEBUG] Running ${modelId} on ${localPathOrUrl} (Weight: ${modelUrl})`)

        execFile(PYTHON_BIN, [pythonScriptPath, localPathOrUrl, modelUrl, conf.toString()], { timeout: 120_000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing yolo_service.py for ${modelId}: ${error.message}`)
                if (stderr) console.error(`yolo_service.py stderr: ${stderr}`)
                return resolve([])
            }

            try {
                const result = JSON.parse(stdout)
                if (result.error) {
                    console.error(`YOLO Python Error (${modelId}): ${result.error}`)
                    return resolve([])
                }

                const detections = (result.objects || []).map((o: any) => ({
                    label: o.label.toLowerCase(),
                    confidence: o.confidence,
                    bbox: o.bbox,
                    model: modelId,
                }))

                resolve(detections)
            } catch (parseError) {
                console.error(`Error parsing YOLO output for ${modelId}: ${parseError}`)
                console.error(`Raw output: ${stdout}`)
                resolve([])
            }
        })
    })
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
        bag: ['handbag', 'backpack', 'suitcase', 'luggage', 'pocketbook', 'purse'],
        monitor: ['screen', 'display', 'tv'],
        mouse: ['pointing_device', 'trackpad'],
        keyboard: ['numeric_keyboard', 'mechanical_keyboard'],
    }

    if (label1 === label2) return true

    for (const [_key, group] of Object.entries(synonyms)) {
        if (group.includes(label1) && group.includes(label2)) return true
        if (group.includes(label1) && label2 === _key) return true
        if (group.includes(label2) && label1 === _key) return true
    }

    return false
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
 * FUNCTION 1: Classify image using YOLOv8 models
 * Runs all 4 YOLO models in parallel and aggregates results
 */
export async function classifyImageWithYOLO(imageUrl: string): Promise<ObjectDetectionResult> {
    const startTime = Date.now()

    // Run all models in parallel
    const [personalItems, phone, electronics, computerApparatus, phoneAndSuitcase] = await Promise.all([
        detectWithYoloPython(imageUrl, YOLO_MODELS.personalItems.weightUrl, YOLO_MODELS.personalItems.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.phone.weightUrl, YOLO_MODELS.phone.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.electronics.weightUrl, YOLO_MODELS.electronics.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.computerApparatus.weightUrl, YOLO_MODELS.computerApparatus.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.phoneAndSuitcase.weightUrl, YOLO_MODELS.phoneAndSuitcase.modelId, 0.3),
    ])

    // Aggregate detections
    const allObjects = [...personalItems, ...phone, ...electronics, ...computerApparatus, ...phoneAndSuitcase]

    // Deduplicate overlapping detections (same object detected by multiple models)
    const deduplicatedObjects = deduplicateDetections(allObjects)

    // Determine primary class (highest confidence detection)
    const primaryClass = deduplicatedObjects.length > 0
        ? deduplicatedObjects[0].label
        : null

    return {
        imageUrl,
        objects: deduplicatedObjects,
        processingTimeMs: Date.now() - startTime,
        primaryClass,
    }
}

// ============ FUNCTION 2: OPENCLIP IMAGE EMBEDDING ============

/**
 * Generate hybrid embedding using OpenCLIP via local Python script
 */
export async function generateOpenClipEmbeddingPython(
    text: string,
    imageUrl?: string
): Promise<number[]> {
    return new Promise((resolve) => {
        const pythonScriptPath = path.join(__dirname, 'open_clip_service.py')

        let localPathOrUrl = imageUrl;
        if (localPathOrUrl && localPathOrUrl.includes('localhost:3000/uploads/')) {
            const filename = localPathOrUrl.split('/uploads/').pop();
            if (filename) {
                localPathOrUrl = path.resolve(__dirname, '../../uploads', filename);
            }
        }

        const inputData = JSON.stringify({ text, image_url: localPathOrUrl })

        execFile(PYTHON_BIN, [pythonScriptPath, inputData], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing open_clip_service.py: ${error.message}`)
                return resolve([])
            }
            if (stderr) {
                console.warn(`open_clip_service.py stderr: ${stderr}`)
            }

            try {
                const result = JSON.parse(stdout)
                if (result.error) {
                    console.error(`OpenCLIP Python Error: ${result.error}`)
                    return resolve([])
                }
                resolve(result.embedding)
            } catch (parseError) {
                console.error(`Error parsing OpenCLIP output: ${parseError}`)
                resolve([])
            }
        })
    })
}

/**
 * FUNCTION 2: Generate image embedding using OpenCLIP via HuggingFace
 * @deprecated Use generateOpenClipEmbeddingPython for hybrid embeddings
 */
export async function embedImageWithOpenCLIP(imageUrl: string): Promise<number[]> {
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

// ============ FUNCTION 3: TF-IDF TEXT EMBEDDING ============

/**
 * Preprocess text for TF-IDF: lowercase, remove punctuation, filter stop words
 */
function preprocessText(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word))
}

/**
 * Calculate term frequency (TF) for a document
 */
function calculateTF(terms: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    const totalTerms = terms.length

    if (totalTerms === 0) return tf

    for (const term of terms) {
        tf.set(term, (tf.get(term) || 0) + 1)
    }

    for (const [term, count] of tf) {
        tf.set(term, count / totalTerms)
    }

    return tf
}

/**
 * Calculate inverse document frequency (IDF)
 * Using a simplified approach with a static corpus of common item terms
 */
function calculateIDF(terms: string[]): Map<string, number> {
    const idf = new Map<string, number>()

    // Static IDF values based on common lost/found item vocabulary
    // Higher values for more distinctive terms
    const commonTerms = new Set(['black', 'blue', 'red', 'white', 'small', 'large', 'new', 'old'])
    const distinctiveTerms = new Set(['serial', 'brand', 'model', 'scratch', 'sticker', 'custom'])

    for (const term of terms) {
        if (distinctiveTerms.has(term)) {
            idf.set(term, 2.5)
        } else if (commonTerms.has(term)) {
            idf.set(term, 1.0)
        } else {
            idf.set(term, 1.5) // Default IDF for other terms
        }
    }

    return idf
}

/**
 * FUNCTION 3: Generate TF-IDF embedding vector from text description
 * Returns a sparse vector representation as a dense array
 */
export function embedTextWithTFIDF(description: string): TextEmbedding {
    const terms = preprocessText(description)

    if (terms.length === 0) {
        return {
            itemId: '',
            description,
            embedding: [],
            vocabulary: [],
        }
    }

    const tf = calculateTF(terms)
    const idf = calculateIDF(terms)

    // Build vocabulary and TF-IDF vector
    const vocabulary = Array.from(new Set(terms)).sort()
    const embedding: number[] = []

    for (const term of vocabulary) {
        const tfValue = tf.get(term) || 0
        const idfValue = idf.get(term) || 1
        embedding.push(tfValue * idfValue)
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    if (magnitude > 0) {
        for (let i = 0; i < embedding.length; i++) {
            embedding[i] = embedding[i] / magnitude
        }
    }

    return {
        itemId: '',
        description,
        embedding,
        vocabulary,
    }
}

/**
 * Calculate TF-IDF similarity between two texts
 * Returns a score from 0-100
 */
export function calculateTFIDFSimilarity(text1: string, text2: string): number {
    const terms1 = preprocessText(text1)
    const terms2 = preprocessText(text2)

    if (terms1.length === 0 || terms2.length === 0) {
        return 0
    }

    // Build combined vocabulary
    const allTerms = new Set([...terms1, ...terms2])
    const idf = calculateIDF(Array.from(allTerms))

    // Build TF-IDF vectors
    const tf1 = calculateTF(terms1)
    const tf2 = calculateTF(terms2)

    // Calculate cosine similarity
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (const term of allTerms) {
        const idfValue = idf.get(term) || 1
        const v1 = (tf1.get(term) || 0) * idfValue
        const v2 = (tf2.get(term) || 0) * idfValue

        dotProduct += v1 * v2
        norm1 += v1 * v1
        norm2 += v2 * v2
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    const similarity = magnitude > 0 ? dotProduct / magnitude : 0

    return Math.round(similarity * 100)
}

// ============ FUNCTION 4: SAVE EMBEDDINGS TO DATABASE ============

/**
 * FUNCTION 4: Save YOLO class, TF-IDF embedding, and OpenCLIP embedding to database
 */
export async function saveEmbeddingsToDatabase(
    itemId: string,
    yoloResult: ObjectDetectionResult,
    imageEmbedding: number[],
    textEmbedding: TextEmbedding,
    hybridEmbedding: number[] = []
): Promise<boolean> {
    try {
        // Update main item record with detection results and traditional embeddings
        await ItemModel.findByIdAndUpdate(itemId, {
            $set: {
                'aiMetadata.detectedObjects': yoloResult.objects.map(o => o.label),
                'aiMetadata.primaryClass': yoloResult.primaryClass,
                'aiMetadata.embedding': imageEmbedding,
                'aiMetadata.textEmbedding': textEmbedding.embedding,
                'aiMetadata.similarityChecked': false,
            },
        })

        // Save hybrid OpenCLIP embedding to its own collection
        if (hybridEmbedding.length > 0) {
            await ItemEmbeddingModel.findOneAndUpdate(
                { itemId: new Types.ObjectId(itemId) },
                {
                    itemId: new Types.ObjectId(itemId),
                    embedding: hybridEmbedding,
                    metadata: {
                        modelName: 'hf-hub:laion/CLIP-ViT-g-14-laion2B-s12B-b42K',
                        sourceFields: ['title', 'description', 'category', 'image'],
                        generatedAt: new Date(),
                    },
                },
                { upsert: true }
            )
        }

        console.log(`Embeddings saved for item ${itemId}:`, {
            detectedObjects: yoloResult.objects.length,
            primaryClass: yoloResult.primaryClass,
            imageEmbeddingDim: imageEmbedding.length,
            textEmbeddingDim: textEmbedding.embedding.length,
            hybridEmbeddingDim: hybridEmbedding.length,
        })

        return true
    } catch (error) {
        console.error(`Error saving embeddings for item ${itemId}:`, error)
        return false
    }
}

// ============ FUNCTION 5: ORCHESTRATION ============

/**
 * FUNCTION 5: Process item image through the complete pipeline
 * Calls functions 1-4 in order:
 * 1. YOLO detection
 * 2. OpenCLIP hybrid embedding
 * 3. TF-IDF embedding
 * 4. Save to database
 */
export async function processItemImage(
    itemId: string,
    imageUrl: string,
    description: string,
    title: string = '',
    category: string = ''
): Promise<ProcessingResult> {
    const startTime = Date.now()

    // Step 1: YOLO object detection
    console.log(`[${itemId}] Starting YOLO classification...`)
    const yoloResult = await classifyImageWithYOLO(imageUrl)
    console.log(`[${itemId}] YOLO detected ${yoloResult.objects.length} objects, primary: ${yoloResult.primaryClass}`)

    // Step 2: OpenCLIP hybrid embedding (Python script)
    // Combine title, description and category for text context
    const textContext = `${title} ${category} ${description}`.trim()
    console.log(`[${itemId}] Generating hybrid OpenCLIP embedding via Python...`)
    const hybridEmbedding = await generateOpenClipEmbeddingPython(textContext, imageUrl)
    console.log(`[${itemId}] Hybrid OpenCLIP embedding dimension: ${hybridEmbedding.length}`)

    // Step 3: TF-IDF text embedding (Maintaining legacy for now)
    console.log(`[${itemId}] Generating TF-IDF embedding...`)
    const textEmbedding = embedTextWithTFIDF(description)
    textEmbedding.itemId = itemId
    console.log(`[${itemId}] TF-IDF embedding dimension: ${textEmbedding.embedding.length}`)

    // We no longer call the deprecated HuggingFace API for OpenCLIP,
    // we use the local Python hybrid embedding instead.
    const legacyImageEmbedding = hybridEmbedding
    // Step 4: Save to database
    console.log(`[${itemId}] Saving embeddings to database...`)
    const savedToDatabase = await saveEmbeddingsToDatabase(
        itemId,
        yoloResult,
        legacyImageEmbedding,
        textEmbedding,
        hybridEmbedding
    )

    const processingTimeMs = Date.now() - startTime
    console.log(`[${itemId}] Processing complete in ${processingTimeMs}ms`)

    return {
        itemId,
        yoloResult,
        imageEmbedding: legacyImageEmbedding,
        textEmbedding: textEmbedding.embedding,
        hybridEmbedding,
        savedToDatabase,
        processingTimeMs,
    }
}

// ============ FAISS-BASED SIMILARITY INDEX ============

/**
 * In-memory FAISS-like index for embeddings
 * Using cosine similarity for vector comparison
 */
class FAISSIndex {
    private embeddings: Map<string, { embedding: number[]; metadata: { objects: string[] } }> =
        new Map()

    add(id: string, embedding: number[], metadata: { objects: string[] }): void {
        this.embeddings.set(id, { embedding, metadata })
    }

    search(
        queryEmbedding: number[],
        k: number = 10
    ): Array<{ id: string; similarity: number; metadata: { objects: string[] } }> {
        const results: Array<{ id: string; similarity: number; metadata: { objects: string[] } }> = []

        for (const [id, data] of this.embeddings) {
            const similarity = this.cosineSimilarity(queryEmbedding, data.embedding)
            results.push({ id, similarity, metadata: data.metadata })
        }

        results.sort((a, b) => b.similarity - a.similarity)
        return results.slice(0, k)
    }

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

    remove(id: string): void {
        this.embeddings.delete(id)
    }

    getAll(): Map<string, { embedding: number[]; metadata: { objects: string[] } }> {
        return this.embeddings
    }

    clear(): void {
        this.embeddings.clear()
    }
}

// Global FAISS index instance
const faissIndex = new FAISSIndex()

// ============ SIMILARITY CALCULATION HELPERS ============

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

    const union = new Set([...set1, ...set2]).size
    return union > 0 ? (intersection / union) * 100 : 0
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

/**
 * Calculate text similarity using TF-IDF
 */
async function calculateTextScore(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<number> {
    const text1 = `${item1.itemAttributes.description} ${item1.itemAttributes.category} ${item1.itemAttributes.color || ''} ${item1.itemAttributes.material || ''}`
    const text2 = `${item2.itemAttributes.description} ${item2.itemAttributes.category} ${item2.itemAttributes.color || ''} ${item2.itemAttributes.material || ''}`

    return calculateTFIDFSimilarity(text1, text2)
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

    // Compute for first image
    const imageUrl = item.images?.[0]
    if (!imageUrl) {
        return { embedding: [], objects: [] }
    }

    // Run detection and embedding in parallel
    const [detection, embedding] = await Promise.all([
        classifyImageWithYOLO(imageUrl),
        embedImageWithOpenCLIP(imageUrl),
    ])

    const objects = detection.objects.map((o) => o.label)

    // Update item's AI metadata
    await ItemModel.findByIdAndUpdate(item._id, {
        $set: {
            'aiMetadata.embedding': embedding,
            'aiMetadata.detectedObjects': objects,
            'aiMetadata.primaryClass': detection.primaryClass,
        },
    })

    // Add to FAISS index
    if (embedding.length > 0) {
        faissIndex.add(item._id.toString(), embedding, { objects })
    }

    return { embedding, objects }
}

/**
 * Calculate image similarity using OpenCLIP + FAISS
 */
async function calculateImageScore(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<{ score: number; objectOverlap: number }> {
    if (!item1.images?.length || !item2.images?.length) {
        return { score: 0, objectOverlap: 0 }
    }

    const [item1Data, item2Data] = await Promise.all([
        getItemImageData(item1),
        getItemImageData(item2),
    ])

    const objectOverlap = calculateObjectOverlap(item1Data.objects, item2Data.objects)

    if (item1Data.embedding.length > 0 && item2Data.embedding.length > 0) {
        const embeddingSimilarity = cosineSimilarity(item1Data.embedding, item2Data.embedding)
        const score = Math.round(embeddingSimilarity * 60 + objectOverlap * 0.4)
        return { score: Math.min(100, score), objectOverlap }
    }

    return { score: Math.round(objectOverlap), objectOverlap }
}

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

    const oppositeType = submissionType === 'lost' ? 'found' : 'lost'
    const candidateItems = (await ItemModel.find({
        submissionType: oppositeType,
        status: { $in: ['submitted', 'matched'] },
        'itemAttributes.category': item.itemAttributes.category,
    }).limit(100)) as unknown as ItemDocument[]

    const results: SimilarityResult[] = []

    for (const candidate of candidateItems) {
        const similarity = await calculateItemSimilarity(item, candidate)

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

    results.sort((a, b) => b.overallScore - a.overallScore)

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
                const lostItemId =
                    item.submissionType === 'lost' ? item._id : matchedItem._id
                const foundItemId =
                    item.submissionType === 'found' ? item._id : matchedItem._id

                const newMatch = new AiMatchModel({
                    lostItemId,
                    foundItemId,
                    similarityScore: similarity.overallScore,
                    featureBreakdown: similarity.featureBreakdown,
                    status: 'pending' as never,
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

    await AiMatchModel.findByIdAndUpdate(matchId, {
        status: decision,
    })

    if (decision === 'accepted') {
        await Promise.all([
            ItemModel.findByIdAndUpdate(match.lostItemId, { status: 'matched' }),
            ItemModel.findByIdAndUpdate(match.foundItemId, { status: 'matched' }),
        ])
    }

    console.log(
        `Match ${matchId} ${decision} by admin ${adminId}${reason ? `: ${reason}` : ''}`
    )
}

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

    return results.sort((a: { similarityScore: number }, b: { similarityScore: number }) => b.similarityScore - a.similarityScore).slice(0, limit)
}

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

/**
 * Group images based on detected object similarity
 */
export async function groupImagesByObjects(
    imageUrls: string[]
): Promise<Map<string, { images: string[]; objects: string[] }>> {
    const groups = new Map<string, { images: string[]; objects: string[] }>()
    const imageObjects = new Map<string, string[]>()

    for (const url of imageUrls) {
        const result = await classifyImageWithYOLO(url)
        const objectLabels = result.objects.map((o) => o.label)
        imageObjects.set(url, objectLabels)
    }

    let groupId = 0
    const assigned = new Set<string>()

    for (const [url, objects] of imageObjects) {
        if (assigned.has(url)) continue

        const currentGroup = { images: [url], objects: [...objects] }
        assigned.add(url)

        for (const [otherUrl, otherObjects] of imageObjects) {
            if (assigned.has(otherUrl)) continue

            const overlap = calculateObjectOverlap(objects, otherObjects)
            if (overlap >= 50) {
                currentGroup.images.push(otherUrl)
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

// ============ MINI-LM TEXT EMBEDDING (BI-ENCODER) ============

import { pipeline } from '@xenova/transformers'

// Singleton pipeline instance
let embeddingPipeline: any = null

/**
 * Get or initialize the embedding pipeline
 */
async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        try {
            console.log('[AI] Initializing local MiniLM bi-encoder...')
            embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
        } catch (error) {
            console.error('Failed to initialize embedding pipeline:', error)
            throw error
        }
    }
    return embeddingPipeline
}

export interface TitleCategoryValidation {
    confidence: number
    isValid: boolean
    title: string
    category: string
}

/**
 * Validate whether an item title/description semantically matches its selected category
 * using a multi-stage LLM reasoning + Bi-Encoder similarity pipeline (via Python script).
 */

export async function validateTitleCategory(
    title: string,
    category: string,
    description: string = '',
    allCategories?: string[]
): Promise<TitleCategoryValidation> {
    const pythonScriptPath = path.join(__dirname, 'ai_category_validator.py');

    return new Promise((resolve) => {
        execFile(PYTHON_BIN, [pythonScriptPath, title, description, category], { env: process.env }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[AI Python Bridge] Error: ${error.message}`);
                console.error(`[AI Python Bridge] Stderr: ${stderr}`);
                return resolve({ confidence: 0, isValid: false, title, category });
            }

            try {
                const lines = stdout.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const result = JSON.parse(lastLine);

                const similarity = parseFloat(result.similarity);

                console.log(`[AI Python Bridge] Similarity Score: ${similarity}`);

                resolve({
                    confidence: similarity,
                    isValid: similarity >= 35,
                    title: `${title} ${description}`.trim(),
                    category
                });
            } catch (parseError) {
                console.error(`[AI Python Bridge] Parse Error: ${parseError}`);
                console.error(`[AI Python Bridge] Raw Output: ${stdout}`);
                resolve({ confidence: 0, isValid: false, title, category });
            }
        });
    });
}

/**
 * Minimum MiniLM cosine-similarity score (0-100 scale) for a YOLO label
 * to be considered semantically matching the user's item.
 * Mirrors the threshold in ai_category_validator.py.
 */
const SEMANTIC_MATCH_THRESHOLD = 35

/**
 * Call validate_image_objects.py to get MiniLM similarity scores between
 * the item text and each unique YOLO-detected label.
 *
 * Uses the exact same sentence-transformer approach as ai_category_validator.py.
 */
function getSemanticLabelScores(
    itemTitle: string,
    itemDescription: string,
    labels: string[]
): Promise<Array<{ label: string; similarity: number }>> {
    const scriptPath = path.join(__dirname, 'validate_image_objects.py')
    const labelsJson = JSON.stringify(labels)

    return new Promise((resolve) => {
        execFile(
            PYTHON_BIN,
            [scriptPath, itemTitle, itemDescription, labelsJson],
            { timeout: 120_000, env: process.env },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('[ImageValidator] Python error:', error.message)
                    console.error('[ImageValidator] Stderr:', stderr)
                    // Fall back: return 0 similarity for all labels
                    resolve(labels.map(l => ({ label: l, similarity: 0 })))
                    return
                }
                try {
                    const lines = stdout.trim().split('\n')
                    const last = lines[lines.length - 1]
                    const parsed = JSON.parse(last)
                    resolve(parsed.results ?? labels.map(l => ({ label: l, similarity: 0 })))
                } catch (e) {
                    console.error('[ImageValidator] Parse error:', e, 'Raw:', stdout)
                    resolve(labels.map(l => ({ label: l, similarity: 0 })))
                }
            }
        )
    })
}

/**
 * Validate an uploaded image using ALL four YOLO models, then semantically match
 * detected classes to the user's reported item via MiniLM.
 *
 * Algorithm:
 *  1. Run all 4 YOLO detectors in parallel.
 *  2. NMS-deduplicate across all detections.
 *  3. For each unique normalised label, record the MAX confidence seen across models.
 *     (Labels undetected by a model contribute 0 — the max naturally captures the best model.)
 *  4. Call the MiniLM Python script (same logic as ai_category_validator.py) to compute
 *     semantic similarity between the item title/description and each detected label.
 *  5. Identify the BEST-MATCHING label (highest MiniLM similarity).
 *  6. If best similarity < SEMANTIC_MATCH_THRESHOLD (35) → item type not detected → soft warn.
 *  7. If best similarity ≥ threshold → count how many instances of that label exist.
 *     If count > 1 → duplicate warning.
 */
export async function validateImageForCategory(
    imageUrl: string,
    _category: string,          // kept for API compatibility, no longer drives model selection
    title: string = '',
    description: string = ''
): Promise<ImageDuplicateCheckResult> {

    // ── Step 1: Run all YOLO detectors in parallel ──────────────────────────
    const [personalItems, phone, electronics, computerApparatus, phoneAndSuitcase] = await Promise.all([
        detectWithYoloPython(imageUrl, YOLO_MODELS.personalItems.weightUrl, YOLO_MODELS.personalItems.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.phone.weightUrl, YOLO_MODELS.phone.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.electronics.weightUrl, YOLO_MODELS.electronics.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.computerApparatus.weightUrl, YOLO_MODELS.computerApparatus.modelId, 0.3),
        detectWithYoloPython(imageUrl, YOLO_MODELS.phoneAndSuitcase.weightUrl, YOLO_MODELS.phoneAndSuitcase.modelId, 0.3),
    ])

    const allObjects = [...personalItems, ...phone, ...electronics, ...computerApparatus, ...phoneAndSuitcase]

    console.log(`[ImageValidator] Detections: Personal=${personalItems.length}, Phone=${phone.length}, Electronics=${electronics.length}, Computer=${computerApparatus.length}, PhoneSuitcase=${phoneAndSuitcase.length}`)

    // ── Step 2: NMS-deduplicate ─────────────────────────────────────────────
    const deduped = deduplicateDetections(allObjects)

    // ── Step 3: Compute Scores per Label ──────────────────────────────────
    // Build: normLabel -> { maxConfidence, count }
    const labelMap: Record<string, {
        maxConfidence: number,
        count: number
    }> = {}

    for (const obj of deduped) {
        const norm = normaliseLabelForCount(obj.label)
        if (!labelMap[norm]) {
            labelMap[norm] = {
                maxConfidence: 0,
                count: 0
            }
        }

        labelMap[norm].maxConfidence = Math.max(labelMap[norm].maxConfidence, obj.confidence)
        labelMap[norm].count++
    }

    const uniqueNormLabels = Object.keys(labelMap)
    const detectedObjects = deduped.map(o => ({ label: o.label, confidence: o.confidence }))
    const labelCounts = Object.fromEntries(uniqueNormLabels.map(l => [l, labelMap[l].count]))

    console.log(`\n========== YOLO DETECTION SUMMARY (All 5 Models) ==========`)
    if (uniqueNormLabels.length === 0) {
        console.log(`   NO OBJECTS DETECTED BY ANY YOLO MODELS`)
        if (!HUGGINGFACE_API_KEY) {
            console.warn(`   ⚠️  WARNING: HUGGINGFACE_API_KEY is missing in .env!`)
        }
    } else {
        console.log(`   Detected ${uniqueNormLabels.length} unique object types:`)
        uniqueNormLabels.forEach(l => {
            console.log(`   - ${l.padEnd(15)}: x${labelMap[l].count} (Max Conf: ${labelMap[l].maxConfidence.toFixed(2)})`)
        })
    }
    console.log(`============================================================\n`)

    if (uniqueNormLabels.length === 0) {
        return {
            hasDuplicates: false,
            duplicateClass: null,
            duplicateCount: 0,
            detectedObjects: [],
            matchedLabels: [],
            labelCounts: {},
            itemDetected: false,
            warning: title
                ? `No objects were detected in this image by any of our AI models. ` +
                `Please upload a clearer photo that shows the "${title}" prominently.`
                : null,
        }
    }

    // ── Step 4: MiniLM semantic scoring ────────────────────────────────────
    // Skip if no item context provided (e.g. category-only call without title)
    let semanticScores: Array<{ label: string; similarity: number }> = []
    if (title || description) {
        semanticScores = await getSemanticLabelScores(title, description, uniqueNormLabels)
        console.log('[ImageValidator] MiniLM semantic scores:', JSON.stringify(semanticScores))
    } else {
        // No title — assign zero similarity to all (we can still check for duplicates structurally)
        semanticScores = uniqueNormLabels.map(l => ({ label: l, similarity: 0 }))
    }

    // ── Step 5: Best-matching label (highest MiniLM similarity) ────────────
    const bestMatch = semanticScores.reduce<{ label: string; similarity: number } | null>(
        (best, curr) => (!best || curr.similarity > best.similarity) ? curr : best,
        null
    )

    const matchedLabels = semanticScores.filter(s => s.similarity >= SEMANTIC_MATCH_THRESHOLD)

    console.log(`[ImageValidator] Best match: ${bestMatch?.label} (sim=${bestMatch?.similarity?.toFixed(1)}), threshold=${SEMANTIC_MATCH_THRESHOLD}`)

    // ── Step 6: Threshold check ─────────────────────────────────────────────
    const itemDetected = !!(title || description)
        ? (bestMatch !== null && bestMatch.similarity >= SEMANTIC_MATCH_THRESHOLD)
        : true   // No title provided — assume detected (structural check only)

    if (!itemDetected) {
        // Best semantic match is below threshold — the item may not be in this photo
        const topRaw = deduped[0]?.label.replace(/_/g, ' ') ?? 'an unrecognised object'
        return {
            hasDuplicates: false,
            duplicateClass: null,
            duplicateCount: 0,
            detectedObjects,
            matchedLabels,
            labelCounts,
            itemDetected: false,
            warning:
                `The image seems to contain "${topRaw}" (AI confidence: ${(bestMatch?.similarity ?? 0).toFixed(0)}%), ` +
                `which doesn't closely match "${title}". ` +
                `Please upload a photo that clearly shows your item.`,
        }
    }

    // ── Step 7: Duplicate count for best-matching class ─────────────────────
    const bestNorm = bestMatch!.label
    const bestEntry = labelMap[bestNorm]

    if (bestEntry.count > 1) {
        const friendlyName = bestNorm.replace(/_/g, ' ')
        return {
            hasDuplicates: true,
            duplicateClass: bestNorm,
            duplicateCount: bestEntry.count,
            detectedObjects,
            matchedLabels,
            labelCounts,
            itemDetected: true,
            warning:
                `This image contains ${bestEntry.count} objects classified as "${friendlyName}" ` +
                `(MiniLM similarity to "${title}": ${bestMatch!.similarity.toFixed(0)}%). ` +
                `Please upload a photo showing only the single item you are reporting.`,
        }
    }

    // All good — exactly one matching item detected
    return {
        hasDuplicates: false,
        duplicateClass: null,
        duplicateCount: 0,
        detectedObjects,
        matchedLabels,
        labelCounts,
        itemDetected: true,
        warning: null,
    }
}

/**
 * Normalise synonym labels so counting works across model differences.
 * e.g. "mobile_phone" → "phone", "notebook" → "laptop"
 */
function normaliseLabelForCount(label: string): string {
    const map: Record<string, string> = {
        mobile_phone: 'phone',
        smartphone: 'phone',
        cellphone: 'phone',
        notebook: 'laptop',
        computer: 'laptop',
        display: 'monitor',
        tv: 'monitor',
        screen: 'monitor',
        mouse: 'mouse',
        keyboard: 'keyboard',
        'pointing_device': 'mouse',
        'trackpad': 'mouse',
        'numeric_keyboard': 'keyboard',
        'mechanical_keyboard': 'keyboard',
        handbag: 'bag',
        backpack: 'bag',
        luggage: 'bag',
        suitcase: 'bag',
        pocketbook: 'bag',
        wallet: 'personal_accessory',
        purse: 'bag',
        bottle: 'container',
        water_bottle: 'container',
        book: 'document',
        magazine: 'document',
        key: 'keys',
        car_key: 'keys',
    }
    return map[label] ?? label
}

// ============ EXPORTS ============

export {
    calculateLocationScore,
    calculateTimeScore,
    DEFAULT_WEIGHTS,
    faissIndex,
    generateMatchExplanation,
    YOLO_MODELS
}

