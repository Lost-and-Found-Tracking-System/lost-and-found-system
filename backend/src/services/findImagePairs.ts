/**
 * Find Image Pairs Service for Lost & Found System
 *
 * Matches "missing" items to their most related "found" items using:
 * - OpenCLIP embedding vector similarity
 * - TF-IDF text similarity
 * - YOLO object class matching
 *
 * Then scores fraud suspicion for competing claims on each found item.
 */

import { Types } from 'mongoose'
import { AiConfigurationModel, AiMatchModel, ClaimModel, ItemModel } from '../models/index.js'
import {
    evaluateCompetingClaims,
    type ClaimEvaluation
} from './fraudDetectionService.js'

// ============ TYPE DEFINITIONS ============

interface ItemDocument {
    _id: Types.ObjectId
    trackingId: string
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
        primaryClass?: string
        embedding?: number[]
        textEmbedding?: number[]
        bestMatchFoundItemId?: Types.ObjectId
        matchScore?: number
    }
}

export interface PairMatch {
    missingItemId: string
    missingTrackingId: string
    foundItemId: string
    foundTrackingId: string
    matchScore: number
    embeddingScore: number
    textScore: number
    classScore: number
    category: string
}

export interface ClaimWithScore {
    claimId: string
    claimantId: string
    suspicionScore: number
    confidenceScore: number
    flags: Array<{ type: string; severity: string; description: string }>
    isWinner: boolean
}

export interface FoundItemClaimsResult {
    foundItemId: string
    foundTrackingId: string
    totalClaims: number
    evaluatedClaims: ClaimWithScore[]
    winnerClaimId: string | null
    requiresManualReview: boolean
}

export interface MatchingSummary {
    totalMissingItems: number
    totalFoundItems: number
    matchedPairs: number
    avgMatchScore: number
    bestMatches: PairMatch[]
}

export interface AIPerformanceMetrics {
    totalMatches: number
    acceptedMatches: number
    rejectedMatches: number
    overriddenMatches: number
    accuracyRate: number
    avgProcessingTimeMs: number
    matchesPerDay: number[]
    currentThresholds: {
        autoApprove: number
        partialMatch: number
    }
    confidenceDistribution: {
        high: number
        medium: number
        low: number
    }
    startDate: Date
    endDate: Date
}

export interface AccuracyOverTime {
    date: string
    total: number
    accepted: number
    rejected: number
    overridden: number
    accuracyRate: number
}

export interface FraudAnalytics {
    totalSuspiciousClaims: number
    fraudFlagsByType: Record<string, number>
    avgSuspicionScore: number
    repeatOffenders: number
}

// ============ SIMILARITY CALCULATION ============

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (!vec1?.length || !vec2?.length || vec1.length !== vec2.length) return 0

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
 * Calculate object class overlap between two items
 */
function calculateClassScore(
    class1: string | undefined,
    objects1: string[] | undefined,
    class2: string | undefined,
    objects2: string[] | undefined
): number {
    let score = 0

    // Primary class match
    if (class1 && class2 && class1.toLowerCase() === class2.toLowerCase()) {
        score += 50
    }

    // Object overlap
    if (objects1?.length && objects2?.length) {
        const set1 = new Set(objects1.map(o => o.toLowerCase()))
        const set2 = new Set(objects2.map(o => o.toLowerCase()))

        let intersection = 0
        for (const obj of set1) {
            if (set2.has(obj)) intersection++
        }

        const union = new Set([...set1, ...set2]).size
        if (union > 0) {
            score += (intersection / union) * 50
        }
    }

    return Math.round(score)
}

/**
 * Calculate overall similarity between a missing and found item
 */
function calculatePairSimilarity(
    missingItem: ItemDocument,
    foundItem: ItemDocument
): { total: number; embedding: number; text: number; class: number } {
    const weights = { embedding: 0.5, text: 0.3, class: 0.2 }

    // Embedding similarity (OpenCLIP)
    const embeddingScore = cosineSimilarity(
        missingItem.aiMetadata?.embedding || [],
        foundItem.aiMetadata?.embedding || []
    ) * 100

    // Text embedding similarity (TF-IDF)
    const textScore = cosineSimilarity(
        missingItem.aiMetadata?.textEmbedding || [],
        foundItem.aiMetadata?.textEmbedding || []
    ) * 100

    // Class/Object similarity (YOLO)
    const classScore = calculateClassScore(
        missingItem.aiMetadata?.primaryClass,
        missingItem.aiMetadata?.detectedObjects,
        foundItem.aiMetadata?.primaryClass,
        foundItem.aiMetadata?.detectedObjects
    )

    // Weighted total
    const total = Math.round(
        embeddingScore * weights.embedding +
        textScore * weights.text +
        classScore * weights.class
    )

    return {
        total,
        embedding: Math.round(embeddingScore),
        text: Math.round(textScore),
        class: classScore,
    }
}

// ============ CORE MATCHING FUNCTIONS ============

/**
 * Find the best matching found item for a missing item
 */
export async function findBestFoundItemForMissing(
    missingItemId: string
): Promise<PairMatch | null> {
    const missingItem = await ItemModel.findById(missingItemId) as unknown as ItemDocument | null
    if (!missingItem || missingItem.submissionType !== 'lost') {
        return null
    }

    // Get all found items in the same category with embeddings
    const foundItems = await ItemModel.find({
        submissionType: 'found',
        status: { $in: ['submitted', 'matched'] },
        'itemAttributes.category': missingItem.itemAttributes.category,
        'aiMetadata.embedding': { $exists: true, $ne: [] },
    }) as unknown as ItemDocument[]

    if (foundItems.length === 0) {
        return null
    }

    let bestMatch: PairMatch | null = null
    let bestScore = 0

    for (const foundItem of foundItems) {
        const similarity = calculatePairSimilarity(missingItem, foundItem)

        if (similarity.total > bestScore) {
            bestScore = similarity.total
            bestMatch = {
                missingItemId: missingItem._id.toString(),
                missingTrackingId: missingItem.trackingId,
                foundItemId: foundItem._id.toString(),
                foundTrackingId: foundItem.trackingId,
                matchScore: similarity.total,
                embeddingScore: similarity.embedding,
                textScore: similarity.text,
                classScore: similarity.class,
                category: missingItem.itemAttributes.category,
            }
        }
    }

    return bestMatch
}

/**
 * Match all missing items to their best found items
 */
export async function matchAllMissingToFoundItems(): Promise<MatchingSummary> {
    console.log('Starting bulk matching of missing items to found items...')

    // Get all lost items with embeddings
    const missingItems = await ItemModel.find({
        submissionType: 'lost',
        status: { $in: ['submitted', 'matched'] },
        'aiMetadata.embedding': { $exists: true, $ne: [] },
    }) as unknown as ItemDocument[]

    const foundItems = await ItemModel.find({
        submissionType: 'found',
        status: { $in: ['submitted', 'matched'] },
        'aiMetadata.embedding': { $exists: true, $ne: [] },
    }) as unknown as ItemDocument[]

    console.log(`Found ${missingItems.length} missing items and ${foundItems.length} found items with embeddings`)

    const matches: PairMatch[] = []
    let totalScore = 0

    for (const missingItem of missingItems) {
        let bestMatch: PairMatch | null = null
        let bestScore = 0

        // Find best matching found item in same category
        const categoryFoundItems = foundItems.filter(
            f => f.itemAttributes.category === missingItem.itemAttributes.category
        )

        for (const foundItem of categoryFoundItems) {
            const similarity = calculatePairSimilarity(missingItem, foundItem)

            if (similarity.total > bestScore) {
                bestScore = similarity.total
                bestMatch = {
                    missingItemId: missingItem._id.toString(),
                    missingTrackingId: missingItem.trackingId,
                    foundItemId: foundItem._id.toString(),
                    foundTrackingId: foundItem.trackingId,
                    matchScore: similarity.total,
                    embeddingScore: similarity.embedding,
                    textScore: similarity.text,
                    classScore: similarity.class,
                    category: missingItem.itemAttributes.category,
                }
            }
        }

        if (bestMatch && bestMatch.matchScore >= 30) {
            matches.push(bestMatch)
            totalScore += bestMatch.matchScore

            // Update database with best match
            await ItemModel.findByIdAndUpdate(missingItem._id, {
                $set: {
                    'aiMetadata.bestMatchFoundItemId': new Types.ObjectId(bestMatch.foundItemId),
                    'aiMetadata.matchScore': bestMatch.matchScore,
                    'aiMetadata.similarityChecked': true,
                },
            })

            console.log(`Matched ${missingItem.trackingId} → ${bestMatch.foundTrackingId} (score: ${bestMatch.matchScore}%)`)
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.matchScore - a.matchScore)

    const summary: MatchingSummary = {
        totalMissingItems: missingItems.length,
        totalFoundItems: foundItems.length,
        matchedPairs: matches.length,
        avgMatchScore: matches.length > 0 ? Math.round(totalScore / matches.length) : 0,
        bestMatches: matches.slice(0, 10),
    }

    console.log(`\nMatching complete: ${summary.matchedPairs} pairs found, avg score: ${summary.avgMatchScore}%`)

    return summary
}

// ============ FRAUD SCORING FUNCTIONS ============

/**
 * Score all claims for a found item using fraud detection
 */
export async function scoreClaimsForFoundItem(
    foundItemId: string
): Promise<FoundItemClaimsResult> {
    const foundItem = await ItemModel.findById(foundItemId) as unknown as ItemDocument | null
    if (!foundItem) {
        throw new Error(`Found item not found: ${foundItemId}`)
    }

    // Evaluate competing claims
    const result = await evaluateCompetingClaims(foundItemId)

    const evaluatedClaims: ClaimWithScore[] = result.evaluations.map((eval_: ClaimEvaluation, index: number) => ({
        claimId: eval_.claimId.toString(),
        claimantId: eval_.claimantId.toString(),
        suspicionScore: 100 - eval_.finalScore, // Inverse of confidence = suspicion
        confidenceScore: eval_.finalScore,
        flags: eval_.flags,
        isWinner: index === 0 && !result.requiresManualReview,
    }))

    return {
        foundItemId: foundItem._id.toString(),
        foundTrackingId: foundItem.trackingId,
        totalClaims: result.evaluations.length,
        evaluatedClaims,
        winnerClaimId: result.winnerClaimId?.toString() || null,
        requiresManualReview: result.requiresManualReview,
    }
}

/**
 * Process all found items with claims and score them
 */
export async function processAllFoundItemClaims(): Promise<{
    processedItems: number
    totalClaims: number
    suspiciousClaims: number
    results: FoundItemClaimsResult[]
}> {
    console.log('Processing claims for all found items...')

    // Get all found items that have pending claims
    const foundItemsWithClaims = await ClaimModel.aggregate([
        { $match: { status: { $in: ['pending', 'conflict'] } } },
        { $group: { _id: '$itemId' } },
    ])

    const results: FoundItemClaimsResult[] = []
    let totalClaims = 0
    let suspiciousClaims = 0

    for (const { _id: foundItemId } of foundItemsWithClaims) {
        try {
            const result = await scoreClaimsForFoundItem(foundItemId.toString())
            results.push(result)
            totalClaims += result.totalClaims

            // Count suspicious claims (suspicion score >= 40)
            suspiciousClaims += result.evaluatedClaims.filter(c => c.suspicionScore >= 40).length

            // Write suspicion scores to database
            for (const claim of result.evaluatedClaims) {
                await ClaimModel.findByIdAndUpdate(claim.claimId, {
                    $set: {
                        aiConfidenceScore: claim.confidenceScore,
                        'fraudRisk.suspicionScore': claim.suspicionScore,
                        'fraudRisk.flags': claim.flags,
                        'fraudRisk.assessedAt': new Date(),
                    },
                })
            }

            console.log(`Scored ${result.totalClaims} claims for item ${result.foundTrackingId}`)
        } catch (error) {
            console.error(`Error processing claims for ${foundItemId}:`, error)
        }
    }

    console.log(`\nProcessed ${results.length} items with ${totalClaims} total claims (${suspiciousClaims} suspicious)`)

    return {
        processedItems: results.length,
        totalClaims,
        suspiciousClaims,
        results,
    }
}

/**
 * Print best matches summary to console
 */
export function printBestMatches(matches: PairMatch[]): void {
    console.log('\n========== BEST MATCHES ==========')
    console.log('Rank | Missing ID       | Found ID         | Score | Category')
    console.log('-----|------------------|------------------|-------|----------')

    matches.slice(0, 20).forEach((match, index) => {
        console.log(
            `${String(index + 1).padStart(4)} | ${match.missingTrackingId.padEnd(16)} | ${match.foundTrackingId.padEnd(16)} | ${String(match.matchScore).padStart(5)}% | ${match.category}`
        )
    })

    console.log('==================================\n')
}

/**
 * Run complete matching and scoring pipeline
 */
export async function runCompletePipeline(): Promise<{
    matching: MatchingSummary
    claims: {
        processedItems: number
        totalClaims: number
        suspiciousClaims: number
    }
}> {
    console.log('=== Starting Complete Matching Pipeline ===\n')

    // Step 1: Match all missing items to found items
    const matchingSummary = await matchAllMissingToFoundItems()

    // Print best matches
    printBestMatches(matchingSummary.bestMatches)

    // Step 2: Process and score all claims
    const claimsResult = await processAllFoundItemClaims()

    console.log('\n=== Pipeline Complete ===')
    console.log(`Matched pairs: ${matchingSummary.matchedPairs}`)
    console.log(`Avg match score: ${matchingSummary.avgMatchScore}%`)
    console.log(`Claims processed: ${claimsResult.totalClaims}`)
    console.log(`Suspicious claims: ${claimsResult.suspiciousClaims}`)

    return {
        matching: matchingSummary,
        claims: {
            processedItems: claimsResult.processedItems,
            totalClaims: claimsResult.totalClaims,
            suspiciousClaims: claimsResult.suspiciousClaims,
        },
    }
}

// ============ ANALYTICS FUNCTIONS (Preserved from aiAnalyticsService) ============

/**
 * Get overall AI performance metrics for a date range
 */
export async function getAIPerformanceMetrics(
    startDate?: Date,
    endDate?: Date
): Promise<AIPerformanceMetrics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate || new Date()

    const matches = await AiMatchModel.find({
        generatedAt: { $gte: start, $lte: end },
    })

    const totalMatches = matches.length
    const acceptedMatches = matches.filter(m => m.status === 'accepted').length
    const rejectedMatches = matches.filter(m => m.status === 'rejected').length
    const overriddenMatches = matches.filter(m => m.status === 'overridden').length

    const accuracyRate = totalMatches > 0
        ? Math.round((acceptedMatches / totalMatches) * 100)
        : 0

    const confidenceDistribution = {
        high: matches.filter(m => m.similarityScore >= 80).length,
        medium: matches.filter(m => m.similarityScore >= 50 && m.similarityScore < 80).length,
        low: matches.filter(m => m.similarityScore < 50).length,
    }

    const matchesPerDay = await calculateMatchesPerDay(start, end)

    const config = await AiConfigurationModel.findOne({ enabled: true }).sort({ version: -1 })
    const currentThresholds = config?.thresholds || { autoApprove: 85, partialMatch: 50 }

    return {
        totalMatches,
        acceptedMatches,
        rejectedMatches,
        overriddenMatches,
        accuracyRate,
        avgProcessingTimeMs: 0,
        matchesPerDay,
        currentThresholds: {
            autoApprove: currentThresholds.autoApprove ?? 85,
            partialMatch: currentThresholds.partialMatch ?? 50,
        },
        confidenceDistribution,
        startDate: start,
        endDate: end,
    }
}

async function calculateMatchesPerDay(startDate: Date, endDate: Date): Promise<number[]> {
    const result = await AiMatchModel.aggregate([
        { $match: { generatedAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ])

    const days: number[] = []
    const dayMs = 24 * 60 * 60 * 1000
    const countMap = new Map(result.map(r => [r._id, r.count]))

    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMs)) {
        const dateStr = d.toISOString().split('T')[0]
        days.push(countMap.get(dateStr) || 0)
    }

    return days
}

/**
 * Calculate accuracy over time (daily breakdown)
 */
export async function calculateAccuracyOverTime(
    startDate?: Date,
    endDate?: Date
): Promise<AccuracyOverTime[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate || new Date()

    const result = await AiMatchModel.aggregate([
        { $match: { generatedAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' } },
                total: { $sum: 1 },
                accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                overridden: { $sum: { $cond: [{ $eq: ['$status', 'overridden'] }, 1, 0] } },
            },
        },
        { $sort: { _id: 1 } },
    ])

    return result.map(r => ({
        date: r._id,
        total: r.total,
        accepted: r.accepted,
        rejected: r.rejected,
        overridden: r.overridden,
        accuracyRate: r.total > 0 ? Math.round((r.accepted / r.total) * 100) : 0,
    }))
}

/**
 * Get fraud detection analytics
 */
export async function getFraudAnalytics(
    startDate?: Date,
    endDate?: Date
): Promise<FraudAnalytics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate || new Date()

    const suspiciousClaims = await ClaimModel.find({
        submittedAt: { $gte: start, $lte: end },
        'fraudRisk.suspicionScore': { $gt: 0 },
    })

    const totalSuspiciousClaims = suspiciousClaims.filter(
        c => (c.fraudRisk as { suspicionScore?: number })?.suspicionScore && (c.fraudRisk as { suspicionScore: number }).suspicionScore >= 40
    ).length

    const fraudFlagsByType: Record<string, number> = {}
    let totalSuspicionScore = 0

    for (const claim of suspiciousClaims) {
        const fraudRisk = claim.fraudRisk as { suspicionScore?: number; flags?: Array<{ type: string }> }
        if (fraudRisk?.suspicionScore) {
            totalSuspicionScore += fraudRisk.suspicionScore
        }
        if (fraudRisk?.flags) {
            for (const flag of fraudRisk.flags) {
                fraudFlagsByType[flag.type] = (fraudFlagsByType[flag.type] || 0) + 1
            }
        }
    }

    const repeatOffenderResult = await ClaimModel.aggregate([
        { $match: { status: 'rejected' } },
        { $group: { _id: '$claimantId', rejectedCount: { $sum: 1 } } },
        { $match: { rejectedCount: { $gte: 3 } } },
        { $count: 'total' },
    ])

    return {
        totalSuspiciousClaims,
        fraudFlagsByType,
        avgSuspicionScore: suspiciousClaims.length > 0
            ? Math.round(totalSuspicionScore / suspiciousClaims.length)
            : 0,
        repeatOffenders: repeatOffenderResult[0]?.total || 0,
    }
}

/**
 * Get match statistics by category
 */
export async function getMatchStatsByCategory(): Promise<
    Array<{
        category: string
        totalMatches: number
        avgScore: number
        acceptanceRate: number
    }>
> {
    const categoryStats = new Map<
        string,
        { total: number; scores: number[]; accepted: number }
    >()

    const matches = await AiMatchModel.find().populate('lostItemId', 'itemAttributes.category')

    for (const match of matches) {
        const item = match.lostItemId as unknown as { itemAttributes?: { category?: string } }
        const category = item?.itemAttributes?.category || 'Unknown'

        if (!categoryStats.has(category)) {
            categoryStats.set(category, { total: 0, scores: [], accepted: 0 })
        }

        const stats = categoryStats.get(category)!
        stats.total++
        stats.scores.push(match.similarityScore)
        if (match.status === 'accepted') {
            stats.accepted++
        }
    }

    return Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        totalMatches: stats.total,
        avgScore: stats.scores.length > 0
            ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
            : 0,
        acceptanceRate: stats.total > 0
            ? Math.round((stats.accepted / stats.total) * 100)
            : 0,
    }))
}

/**
 * Get threshold effectiveness analysis
 */
export async function analyzeThresholdEffectiveness(): Promise<{
    currentConfig: {
        autoApprove: number
        partialMatch: number
    }
    recommendations: string[]
    stats: {
        aboveAutoApprove: { total: number; accepted: number; rejected: number }
        betweenThresholds: { total: number; accepted: number; rejected: number }
        belowPartialMatch: { total: number; accepted: number; rejected: number }
    }
}> {
    const config = await AiConfigurationModel.findOne({ enabled: true }).sort({ version: -1 })
    const autoApprove = config?.thresholds?.autoApprove ?? 85
    const partialMatch = config?.thresholds?.partialMatch ?? 50

    const matches = await AiMatchModel.find()

    const stats = {
        aboveAutoApprove: { total: 0, accepted: 0, rejected: 0 },
        betweenThresholds: { total: 0, accepted: 0, rejected: 0 },
        belowPartialMatch: { total: 0, accepted: 0, rejected: 0 },
    }

    for (const match of matches) {
        let bucket: keyof typeof stats
        if (match.similarityScore >= autoApprove) {
            bucket = 'aboveAutoApprove'
        } else if (match.similarityScore >= partialMatch) {
            bucket = 'betweenThresholds'
        } else {
            bucket = 'belowPartialMatch'
        }

        stats[bucket].total++
        if (match.status === 'accepted') {
            stats[bucket].accepted++
        } else if (match.status === 'rejected') {
            stats[bucket].rejected++
        }
    }

    const recommendations: string[] = []

    if (stats.aboveAutoApprove.total > 0) {
        const acceptanceRate = (stats.aboveAutoApprove.accepted / stats.aboveAutoApprove.total) * 100
        if (acceptanceRate < 90) {
            recommendations.push(
                `Consider raising auto-approve threshold: ${Math.round(acceptanceRate)}% acceptance rate above ${autoApprove}%`
            )
        }
    }

    if (stats.belowPartialMatch.accepted > 0) {
        recommendations.push(
            `${stats.belowPartialMatch.accepted} matches below partial threshold were accepted - consider lowering threshold`
        )
    }

    if (recommendations.length === 0) {
        recommendations.push('Current thresholds appear to be well-calibrated')
    }

    return {
        currentConfig: { autoApprove, partialMatch },
        recommendations,
        stats,
    }
}
