/**
 * Text Similarity Service for Lost & Found System
 *
 * Implements a hybrid TF-IDF + Cosine Similarity approach for matching
 * lost and found item descriptions.
 *
 * Features:
 * - TF-IDF vectorization (no external API required)
 * - Category/color/material bonus weighting
 * - Optional HuggingFace embeddings for semantic similarity
 */

import { Types } from 'mongoose'

// ============ TYPE DEFINITIONS ============

export interface ItemDocument {
    _id: Types.ObjectId
    submissionType: 'lost' | 'found'
    itemAttributes: {
        category: string
        color?: string
        material?: string
        size?: string
        description: string
    }
}

export interface ItemFeatures {
    description: string
    category: string
    color: string
    material: string
    combinedText: string
}

export interface TextSimilarityResult {
    tfidfScore: number // 0-100
    categoryBonus: number // 0-20
    attributeBonus: number // 0-20 (color + material)
    finalScore: number // 0-100
    explanation: string[]
}

// ============ CONFIGURATION ============

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

// Weights for hybrid scoring
const WEIGHTS = {
    tfidf: 0.6,
    embedding: 0.4,
    categoryBonus: 20,
    colorBonus: 10,
    materialBonus: 10,
}

// Common English stop words to filter out
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
    'item', 'please', 'help', 'looking', 'looking', 'find'
])

// ============ TEXT PREPROCESSING ============

/**
 * Preprocess text for TF-IDF: lowercase, remove punctuation, filter stop words
 */
function preprocessText(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word))
}

/**
 * Extract relevant features from an item for text comparison
 */
export function extractItemFeatures(item: ItemDocument): ItemFeatures {
    const description = item.itemAttributes.description || ''
    const category = item.itemAttributes.category || ''
    const color = item.itemAttributes.color || ''
    const material = item.itemAttributes.material || ''

    // Combine all text features
    const combinedText = [description, category, color, material]
        .filter(Boolean)
        .join(' ')

    return {
        description,
        category: category.toLowerCase(),
        color: color.toLowerCase(),
        material: material.toLowerCase(),
        combinedText,
    }
}

// ============ TF-IDF IMPLEMENTATION ============

/**
 * Calculate term frequency (TF) for a document
 * TF = (number of times term appears in document) / (total terms in document)
 */
function calculateTF(terms: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    const totalTerms = terms.length

    if (totalTerms === 0) return tf

    // Count term frequencies
    for (const term of terms) {
        tf.set(term, (tf.get(term) || 0) + 1)
    }

    // Normalize by total terms
    for (const [term, count] of tf) {
        tf.set(term, count / totalTerms)
    }

    return tf
}

/**
 * Calculate inverse document frequency (IDF) for terms across documents
 * IDF = log(N / df) where N = total docs, df = docs containing term
 */
function calculateIDF(documents: string[][]): Map<string, number> {
    const idf = new Map<string, number>()
    const totalDocs = documents.length

    // Count document frequency for each term
    const docFreq = new Map<string, number>()
    for (const doc of documents) {
        const uniqueTerms = new Set(doc)
        for (const term of uniqueTerms) {
            docFreq.set(term, (docFreq.get(term) || 0) + 1)
        }
    }

    // Calculate IDF with smoothing to avoid division by zero
    for (const [term, df] of docFreq) {
        idf.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1) // Add 1 for smoothing
    }

    return idf
}

/**
 * Build TF-IDF vector for a document
 */
function buildTFIDFVector(terms: string[], idf: Map<string, number>): Map<string, number> {
    const tf = calculateTF(terms)
    const tfidf = new Map<string, number>()

    for (const [term, tfValue] of tf) {
        const idfValue = idf.get(term) || 1
        tfidf.set(term, tfValue * idfValue)
    }

    return tfidf
}

// ============ COSINE SIMILARITY ============

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
function cosineSimilarityMap(vec1: Map<string, number>, vec2: Map<string, number>): number {
    // Get all unique terms
    const allTerms = new Set([...vec1.keys(), ...vec2.keys()])

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (const term of allTerms) {
        const v1 = vec1.get(term) || 0
        const v2 = vec2.get(term) || 0

        dotProduct += v1 * v2
        norm1 += v1 * v1
        norm2 += v2 * v2
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    return magnitude > 0 ? dotProduct / magnitude : 0
}

/**
 * Calculate cosine similarity between two number arrays
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
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

// ============ MAIN TF-IDF SIMILARITY ============

/**
 * Calculate TF-IDF based text similarity between two texts
 * Returns a score from 0-100
 */
export function calculateTFIDFSimilarity(text1: string, text2: string): number {
    const terms1 = preprocessText(text1)
    const terms2 = preprocessText(text2)

    if (terms1.length === 0 || terms2.length === 0) {
        return 0
    }

    // Calculate IDF across both documents
    const idf = calculateIDF([terms1, terms2])

    // Build TF-IDF vectors
    const vec1 = buildTFIDFVector(terms1, idf)
    const vec2 = buildTFIDFVector(terms2, idf)

    // Calculate cosine similarity
    const similarity = cosineSimilarityMap(vec1, vec2)

    return Math.round(similarity * 100)
}

// ============ HUGGINGFACE EMBEDDINGS (OPTIONAL) ============

/**
 * Generate text embedding using HuggingFace Sentence Transformers
 * Falls back gracefully if API is unavailable
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
    if (!HUGGINGFACE_API_KEY) {
        return []
    }

    try {
        const response = await fetch(`${HUGGINGFACE_API_URL}/sentence-transformers/all-MiniLM-L6-v2`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: text,
            }),
        })

        if (!response.ok) {
            console.warn(`Text embedding API error: ${response.statusText}`)
            return []
        }

        const embedding = (await response.json()) as number[]
        return Array.isArray(embedding) ? embedding : []
    } catch (error) {
        console.warn('Text embedding API unavailable, using TF-IDF fallback:', error)
        return []
    }
}

/**
 * Calculate embedding-based similarity
 * Returns a score from 0-100 or -1 if embeddings unavailable
 */
async function calculateEmbeddingSimilarity(text1: string, text2: string): Promise<number> {
    const [embedding1, embedding2] = await Promise.all([
        generateTextEmbedding(text1),
        generateTextEmbedding(text2),
    ])

    if (embedding1.length === 0 || embedding2.length === 0) {
        return -1 // Indicates embeddings not available
    }

    const similarity = cosineSimilarity(embedding1, embedding2)
    return Math.round(similarity * 100)
}

// ============ ATTRIBUTE MATCHING ============

/**
 * Calculate bonus score for matching attributes
 */
function calculateAttributeBonus(
    features1: ItemFeatures,
    features2: ItemFeatures
): { categoryBonus: number; attributeBonus: number; explanations: string[] } {
    const explanations: string[] = []
    let categoryBonus = 0
    let attributeBonus = 0

    // Category match bonus (exact match)
    if (features1.category && features2.category) {
        if (features1.category === features2.category) {
            categoryBonus = WEIGHTS.categoryBonus
            explanations.push(`Same category: "${features1.category}"`)
        } else if (
            features1.category.includes(features2.category) ||
            features2.category.includes(features1.category)
        ) {
            categoryBonus = WEIGHTS.categoryBonus / 2
            explanations.push(`Related categories: "${features1.category}" and "${features2.category}"`)
        }
    }

    // Color match bonus
    if (features1.color && features2.color) {
        if (features1.color === features2.color) {
            attributeBonus += WEIGHTS.colorBonus
            explanations.push(`Same color: "${features1.color}"`)
        } else if (areRelatedColors(features1.color, features2.color)) {
            attributeBonus += WEIGHTS.colorBonus / 2
            explanations.push(`Similar colors: "${features1.color}" and "${features2.color}"`)
        }
    }

    // Material match bonus
    if (features1.material && features2.material) {
        if (features1.material === features2.material) {
            attributeBonus += WEIGHTS.materialBonus
            explanations.push(`Same material: "${features1.material}"`)
        }
    }

    return { categoryBonus, attributeBonus, explanations }
}

/**
 * Check if two colors are related (e.g., "dark blue" and "navy")
 */
function areRelatedColors(color1: string, color2: string): boolean {
    const colorGroups: Record<string, string[]> = {
        blue: ['navy', 'azure', 'cyan', 'teal', 'dark blue', 'light blue', 'sky blue', 'royal blue'],
        red: ['maroon', 'crimson', 'scarlet', 'burgundy', 'dark red', 'wine'],
        green: ['olive', 'lime', 'emerald', 'forest', 'dark green', 'light green', 'mint'],
        black: ['dark', 'charcoal', 'ebony', 'jet'],
        white: ['cream', 'ivory', 'off-white', 'pearl', 'beige'],
        brown: ['tan', 'chocolate', 'coffee', 'mocha', 'khaki', 'caramel'],
        gray: ['grey', 'silver', 'slate', 'charcoal', 'ash'],
        pink: ['rose', 'salmon', 'fuchsia', 'magenta', 'coral'],
        purple: ['violet', 'lavender', 'plum', 'mauve', 'indigo'],
        orange: ['coral', 'peach', 'tangerine', 'amber'],
        yellow: ['gold', 'golden', 'lemon', 'mustard', 'cream'],
    }

    // Direct substring check
    if (color1.includes(color2) || color2.includes(color1)) return true

    // Check color groups
    for (const [base, variants] of Object.entries(colorGroups)) {
        const allColors = [base, ...variants]
        const hasColor1 = allColors.some(c => color1.includes(c) || c.includes(color1))
        const hasColor2 = allColors.some(c => color2.includes(c) || c.includes(color2))
        if (hasColor1 && hasColor2) return true
    }

    return false
}

// ============ HYBRID SIMILARITY CALCULATION ============

/**
 * Calculate hybrid text similarity combining TF-IDF and embeddings
 * Uses TF-IDF as primary method with optional embedding enhancement
 *
 * Steps:
 * 1. Extract description, category, color, material from both items
 * 2. Generate TF-IDF vectors for combined text
 * 3. Calculate cosine similarity
 * 4. Apply category/attribute match bonuses
 * 5. Optionally blend with embedding similarity if available
 */
export async function calculateHybridTextSimilarity(
    item1: ItemDocument,
    item2: ItemDocument
): Promise<TextSimilarityResult> {
    const features1 = extractItemFeatures(item1)
    const features2 = extractItemFeatures(item2)

    // Calculate TF-IDF similarity on combined text
    const tfidfScore = calculateTFIDFSimilarity(features1.combinedText, features2.combinedText)

    // Calculate attribute bonuses
    const { categoryBonus, attributeBonus, explanations } = calculateAttributeBonus(features1, features2)

    // Try to get embedding similarity for hybrid approach
    let embeddingScore = -1
    try {
        embeddingScore = await calculateEmbeddingSimilarity(
            features1.combinedText,
            features2.combinedText
        )
    } catch {
        // Embeddings unavailable, continue with TF-IDF only
    }

    // Calculate final score
    let baseScore: number
    if (embeddingScore >= 0) {
        // Hybrid: weighted combination of TF-IDF and embedding
        baseScore = Math.round(tfidfScore * WEIGHTS.tfidf + embeddingScore * WEIGHTS.embedding)
        explanations.push(`Text similarity: ${tfidfScore}% (TF-IDF) + ${embeddingScore}% (semantic)`)
    } else {
        // TF-IDF only
        baseScore = tfidfScore
        if (tfidfScore > 0) {
            explanations.push(`Text similarity: ${tfidfScore}%`)
        }
    }

    // Apply bonuses but cap at 100
    const finalScore = Math.min(100, baseScore + categoryBonus + attributeBonus)

    return {
        tfidfScore,
        categoryBonus,
        attributeBonus,
        finalScore,
        explanation: explanations,
    }
}

/**
 * Simple synchronous text similarity using TF-IDF only
 * Use this when you don't need async embedding support
 */
export function calculateSimpleTextSimilarity(
    item1: ItemDocument,
    item2: ItemDocument
): TextSimilarityResult {
    const features1 = extractItemFeatures(item1)
    const features2 = extractItemFeatures(item2)

    // Calculate TF-IDF similarity on combined text
    const tfidfScore = calculateTFIDFSimilarity(features1.combinedText, features2.combinedText)

    // Calculate attribute bonuses
    const { categoryBonus, attributeBonus, explanations } = calculateAttributeBonus(features1, features2)

    // Add TF-IDF explanation
    if (tfidfScore > 0) {
        explanations.push(`Text similarity: ${tfidfScore}%`)
    }

    // Apply bonuses but cap at 100
    const finalScore = Math.min(100, tfidfScore + categoryBonus + attributeBonus)

    return {
        tfidfScore,
        categoryBonus,
        attributeBonus,
        finalScore,
        explanation: explanations,
    }
}

// ============ QUICK SEARCH HELPER ============

/**
 * Quick text-based search for real-time suggestions
 * Prioritizes speed over accuracy
 */
export function quickTextMatch(
    queryText: string,
    queryCategory: string,
    candidateItem: ItemDocument
): number {
    const candidateFeatures = extractItemFeatures(candidateItem)

    // Quick category check first (fastest)
    let score = 0
    if (queryCategory && candidateFeatures.category === queryCategory.toLowerCase()) {
        score += 30
    }

    // Quick keyword overlap
    const queryTerms = preprocessText(queryText)
    const candidateTerms = preprocessText(candidateFeatures.combinedText)

    if (queryTerms.length === 0 || candidateTerms.length === 0) {
        return score
    }

    const candidateSet = new Set(candidateTerms)
    let matches = 0
    for (const term of queryTerms) {
        if (candidateSet.has(term)) {
            matches++
        }
    }

    // Jaccard-like similarity
    const overlap = matches / queryTerms.length
    score += Math.round(overlap * 70)

    return Math.min(100, score)
}
