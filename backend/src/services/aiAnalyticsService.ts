/**
 * AI Analytics Service for Lost & Found System
 *
 * Tracks and reports AI performance metrics:
 * - Match accuracy rates (accepted/rejected ratio)
 * - Processing times
 * - Confidence distribution
 * - Threshold effectiveness
 */

import { AiConfigurationModel, AiMatchModel, ClaimModel } from '../models/index.js'

// ============ TYPE DEFINITIONS ============

export interface AIPerformanceMetrics {
    // Accuracy
    totalMatches: number
    acceptedMatches: number
    rejectedMatches: number
    overriddenMatches: number
    accuracyRate: number // accepted / total

    // Processing
    avgProcessingTimeMs: number
    matchesPerDay: number[]

    // Thresholds
    currentThresholds: {
        autoApprove: number
        partialMatch: number
    }

    // Confidence distribution
    confidenceDistribution: {
        high: number // 80-100
        medium: number // 50-79
        low: number // 0-49
    }

    // Time range
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

// ============ MAIN ANALYTICS FUNCTIONS ============

/**
 * Get overall AI performance metrics for a date range
 */
export async function getAIPerformanceMetrics(
    startDate?: Date,
    endDate?: Date
): Promise<AIPerformanceMetrics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: last 30 days
    const end = endDate || new Date()

    // Get all matches in date range
    const matches = await AiMatchModel.find({
        generatedAt: { $gte: start, $lte: end },
    })

    const totalMatches = matches.length
    const acceptedMatches = matches.filter(m => m.status === 'accepted').length
    const rejectedMatches = matches.filter(m => m.status === 'rejected').length
    const overriddenMatches = matches.filter(m => m.status === 'overridden').length

    // Calculate accuracy rate
    const accuracyRate = totalMatches > 0
        ? Math.round((acceptedMatches / totalMatches) * 100)
        : 0

    // Calculate confidence distribution
    const confidenceDistribution = {
        high: matches.filter(m => m.similarityScore >= 80).length,
        medium: matches.filter(m => m.similarityScore >= 50 && m.similarityScore < 80).length,
        low: matches.filter(m => m.similarityScore < 50).length,
    }

    // Get matches per day for the last 30 days
    const matchesPerDay = await calculateMatchesPerDay(start, end)

    // Get current thresholds
    const config = await AiConfigurationModel.findOne({ enabled: true }).sort({ version: -1 })
    const currentThresholds = config?.thresholds || { autoApprove: 85, partialMatch: 50 }

    // Note: avgProcessingTimeMs would require storing processing time in matches
    // For now, we'll return 0 as a placeholder
    const avgProcessingTimeMs = 0

    return {
        totalMatches,
        acceptedMatches,
        rejectedMatches,
        overriddenMatches,
        accuracyRate,
        avgProcessingTimeMs,
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

/**
 * Calculate matches per day over a date range
 */
async function calculateMatchesPerDay(startDate: Date, endDate: Date): Promise<number[]> {
    const result = await AiMatchModel.aggregate([
        {
            $match: {
                generatedAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ])

    // Fill in missing days with 0
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
        {
            $match: {
                generatedAt: { $gte: start, $lte: end },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$generatedAt' },
                },
                total: { $sum: 1 },
                accepted: {
                    $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
                },
                rejected: {
                    $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
                },
                overridden: {
                    $sum: { $cond: [{ $eq: ['$status', 'overridden'] }, 1, 0] },
                },
            },
        },
        {
            $sort: { _id: 1 },
        },
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

    // Get all claims with fraud risk in date range
    const suspiciousClaims = await ClaimModel.find({
        submittedAt: { $gte: start, $lte: end },
        'fraudRisk.suspicionScore': { $gt: 0 },
    })

    const totalSuspiciousClaims = suspiciousClaims.filter(
        c => (c.fraudRisk as { suspicionScore?: number })?.suspicionScore && (c.fraudRisk as { suspicionScore: number }).suspicionScore >= 40
    ).length

    // Count fraud flags by type
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

    // Count repeat offenders (users with 3+ rejected claims)
    const repeatOffenderResult = await ClaimModel.aggregate([
        {
            $match: {
                status: 'rejected',
            },
        },
        {
            $group: {
                _id: '$claimantId',
                rejectedCount: { $sum: 1 },
            },
        },
        {
            $match: {
                rejectedCount: { $gte: 3 },
            },
        },
        {
            $count: 'total',
        },
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

    // Get matches with item data
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

    // Generate recommendations
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
