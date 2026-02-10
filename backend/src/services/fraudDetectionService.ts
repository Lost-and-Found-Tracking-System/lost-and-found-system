/**
 * Fraud Detection Service for Lost & Found System
 *
 * Evaluates competing claims for items, ranks claimants by AI-computed confidence,
 * awards the best match, and marks others as suspicious.
 *
 * Suspicious Claim Criteria:
 * - Repeatedly claiming same/similar items
 * - Not providing proper proof description
 * - Low confidence vs winner
 */

import { Types } from 'mongoose'
import { ClaimModel, ItemModel } from '../models/index.js'

// ============ INLINE TF-IDF IMPLEMENTATION ============

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
    'whom', 'this', 'that', 'these', 'those', 'lost', 'found', 'item', 'please', 'help'
])

function preprocessText(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && !STOP_WORDS.has(word))
}

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

function calculateTFIDFSimilarity(text1: string, text2: string): number {
    const terms1 = preprocessText(text1)
    const terms2 = preprocessText(text2)

    if (terms1.length === 0 || terms2.length === 0) {
        return 0
    }

    const allTerms = new Set([...terms1, ...terms2])
    const tf1 = calculateTF(terms1)
    const tf2 = calculateTF(terms2)

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (const term of allTerms) {
        const v1 = tf1.get(term) || 0
        const v2 = tf2.get(term) || 0

        dotProduct += v1 * v2
        norm1 += v1 * v1
        norm2 += v2 * v2
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    const similarity = magnitude > 0 ? dotProduct / magnitude : 0

    return Math.round(similarity * 100)
}

// ============ TYPE DEFINITIONS ============

export interface FraudFlag {
    type: string
    severity: 'warning' | 'critical'
    description: string
}

export interface FraudRiskAssessment {
    suspicionScore: number // 0-100
    flags: FraudFlag[]
    assessedAt: Date
}

export interface ClaimEvaluation {
    claimId: Types.ObjectId
    claimantId: Types.ObjectId
    confidenceScore: number
    proofQualityScore: number
    historyScore: number
    finalScore: number
    flags: FraudFlag[]
}

export interface CompetingClaimsResult {
    itemId: Types.ObjectId
    winnerId: Types.ObjectId | null
    winnerClaimId: Types.ObjectId | null
    winnerConfidence: number
    evaluations: ClaimEvaluation[]
    requiresManualReview: boolean
    reason?: string
}

interface ClaimDocument {
    _id: Types.ObjectId
    itemId: Types.ObjectId
    claimantId: Types.ObjectId
    ownershipProofs: string[]
    proofScore: number
    status: string
    aiConfidenceScore?: number
    submittedAt: Date
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
    images?: string[]
}

// ============ CONFIGURATION ============

const CONFIG = {
    // Minimum confidence for auto-award
    autoAwardThreshold: 70,
    // Minimum gap between winner and 2nd place for auto-award
    minimumConfidenceGap: 15,
    // Proof quality thresholds
    minProofLength: 20,
    goodProofLength: 100,
    // History scoring
    maxRejectionPenalty: 30,
    rejectionsForMaxPenalty: 5,
    // Suspicion thresholds
    suspiciousThreshold: 40,
    criticalThreshold: 60,
}

// Proof quality keywords that indicate strong evidence
const STRONG_PROOF_KEYWORDS = [
    'serial', 'receipt', 'photo', 'scratch', 'sticker', 'custom', 'engraved',
    'purchase', 'bought', 'gift', 'unique', 'marking', 'damage', 'dent',
    'inscription', 'initials', 'name', 'label', 'tag', 'case', 'cover',
]

// ============ PROOF QUALITY ASSESSMENT ============

/**
 * Assess the quality of ownership proofs
 * Returns a score from 0-100
 */
export function assessProofQuality(proofs: string[]): {
    score: number
    flags: FraudFlag[]
} {
    if (!proofs || proofs.length === 0) {
        return {
            score: 0,
            flags: [{
                type: 'NO_PROOF',
                severity: 'critical',
                description: 'No ownership proof provided',
            }],
        }
    }

    const flags: FraudFlag[] = []
    let totalScore = 0

    for (const proof of proofs) {
        let proofScore = 0
        const trimmedProof = proof.trim()

        // Length scoring
        if (trimmedProof.length < CONFIG.minProofLength) {
            flags.push({
                type: 'VAGUE_PROOF',
                severity: 'warning',
                description: `Proof too short (${trimmedProof.length} chars)`,
            })
            proofScore += 10
        } else if (trimmedProof.length >= CONFIG.goodProofLength) {
            proofScore += 40
        } else {
            proofScore += 20
        }

        // Specificity scoring (mentions specific details)
        const lowerProof = trimmedProof.toLowerCase()
        const matchedKeywords = STRONG_PROOF_KEYWORDS.filter(kw => lowerProof.includes(kw))
        proofScore += Math.min(40, matchedKeywords.length * 10)

        // Image/URL proof bonus
        if (proof.startsWith('http') && (proof.includes('cloudinary') || proof.includes('image'))) {
            proofScore += 20
        }

        totalScore += Math.min(100, proofScore)
    }

    // Average across all proofs
    const avgScore = Math.round(totalScore / proofs.length)

    if (avgScore < 30) {
        flags.push({
            type: 'LOW_PROOF_QUALITY',
            severity: 'warning',
            description: 'Ownership proofs lack specific details',
        })
    }

    return { score: avgScore, flags }
}

// ============ CLAIMANT HISTORY ============

/**
 * Get claimant's claim history and calculate history-based score penalty
 */
export async function getClaimantHistoryScore(userId: Types.ObjectId): Promise<{
    score: number // 100 = perfect history, lower = more rejections
    totalClaims: number
    approvedClaims: number
    rejectedClaims: number
    suspiciousClaims: number
    flags: FraudFlag[]
}> {
    const claims = await ClaimModel.find({
        claimantId: userId,
    }).select('status')

    const totalClaims = claims.length
    const approvedClaims = claims.filter(c => c.status === 'approved').length
    const rejectedClaims = claims.filter(c => c.status === 'rejected').length
    const suspiciousClaims = claims.filter(c => c.status === 'suspicious').length

    const flags: FraudFlag[] = []

    // Calculate penalty based on rejection ratio
    let score = 100
    if (totalClaims > 0) {
        const rejectionRatio = rejectedClaims / totalClaims
        score -= Math.round(rejectionRatio * CONFIG.maxRejectionPenalty)

        // Additional penalty for many rejections
        if (rejectedClaims >= CONFIG.rejectionsForMaxPenalty) {
            score -= 20
            flags.push({
                type: 'REPEAT_OFFENDER',
                severity: 'critical',
                description: `User has ${rejectedClaims} rejected claims`,
            })
        } else if (rejectedClaims >= 3) {
            flags.push({
                type: 'MULTIPLE_REJECTIONS',
                severity: 'warning',
                description: `User has ${rejectedClaims} rejected claims`,
            })
        }

        // Penalty for previous suspicious claims
        if (suspiciousClaims > 0) {
            score -= suspiciousClaims * 5
            flags.push({
                type: 'PRIOR_SUSPICIOUS',
                severity: 'warning',
                description: `User has ${suspiciousClaims} prior suspicious claims`,
            })
        }
    }

    return {
        score: Math.max(0, score),
        totalClaims,
        approvedClaims,
        rejectedClaims,
        suspiciousClaims,
        flags,
    }
}

/**
 * Check if user has recently claimed similar items (same category)
 */
async function checkSimilarItemClaims(
    userId: Types.ObjectId,
    currentItemId: Types.ObjectId,
    category: string
): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = []

    // Get user's recent claims (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentClaims = await ClaimModel.find({
        claimantId: userId,
        itemId: { $ne: currentItemId },
        submittedAt: { $gte: thirtyDaysAgo },
    }).populate('itemId')

    // Check for claims on items with same category
    let sameCategory = 0
    for (const claim of recentClaims) {
        const item = claim.itemId as unknown as ItemDocument
        if (item?.itemAttributes?.category === category) {
            sameCategory++
        }
    }

    if (sameCategory >= 3) {
        flags.push({
            type: 'REPEATED_CATEGORY_CLAIMS',
            severity: 'critical',
            description: `User has claimed ${sameCategory} items in "${category}" category recently`,
        })
    } else if (sameCategory >= 1) {
        flags.push({
            type: 'SIMILAR_ITEM_CLAIMS',
            severity: 'warning',
            description: `User has claimed ${sameCategory} other items in same category`,
        })
    }

    return flags
}

// ============ CLAIM CONFIDENCE CALCULATION ============

/**
 * Calculate claim confidence by comparing proof text against item description
 */
export async function calculateClaimConfidence(
    claim: ClaimDocument,
    item: ItemDocument
): Promise<number> {
    if (!claim.ownershipProofs || claim.ownershipProofs.length === 0) {
        return 0
    }

    // Combine all proofs into one text
    const proofText = claim.ownershipProofs.join(' ')

    // Use TF-IDF similarity between proof and item description
    const similarity = calculateTFIDFSimilarity(
        proofText,
        `${item.itemAttributes.description} ${item.itemAttributes.category} ${item.itemAttributes.color || ''} ${item.itemAttributes.material || ''}`
    )

    return similarity
}

// ============ MAIN EVALUATION FUNCTIONS ============

/**
 * Evaluate a single claim against an item
 */
export async function evaluateClaim(
    claim: ClaimDocument,
    item: ItemDocument
): Promise<ClaimEvaluation> {
    const flags: FraudFlag[] = []

    // 1. Calculate proof-to-item confidence
    const confidenceScore = await calculateClaimConfidence(claim, item)

    // 2. Assess proof quality
    const proofQuality = assessProofQuality(claim.ownershipProofs)
    flags.push(...proofQuality.flags)

    // 3. Get claimant history
    const history = await getClaimantHistoryScore(claim.claimantId)
    flags.push(...history.flags)

    // 4. Check for similar item claims
    const similarFlags = await checkSimilarItemClaims(
        claim.claimantId,
        item._id,
        item.itemAttributes.category
    )
    flags.push(...similarFlags)

    // Calculate final score (weighted combination)
    const finalScore = Math.round(
        confidenceScore * 0.4 +
        proofQuality.score * 0.35 +
        history.score * 0.25
    )

    return {
        claimId: claim._id,
        claimantId: claim.claimantId,
        confidenceScore,
        proofQualityScore: proofQuality.score,
        historyScore: history.score,
        finalScore,
        flags,
    }
}

/**
 * Evaluate all competing claims for an item and determine winner
 */
export async function evaluateCompetingClaims(
    itemId: Types.ObjectId | string
): Promise<CompetingClaimsResult> {
    const itemObjectId = typeof itemId === 'string' ? new Types.ObjectId(itemId) : itemId

    // Fetch the item
    const item = await ItemModel.findById(itemObjectId) as unknown as ItemDocument | null
    if (!item) {
        throw new Error(`Item not found: ${itemId}`)
    }

    // Fetch all pending claims for this item
    const claims = await ClaimModel.find({
        itemId: itemObjectId,
        status: { $in: ['pending', 'conflict'] },
    }) as unknown as ClaimDocument[]

    if (claims.length === 0) {
        return {
            itemId: itemObjectId,
            winnerId: null,
            winnerClaimId: null,
            winnerConfidence: 0,
            evaluations: [],
            requiresManualReview: false,
            reason: 'No pending claims',
        }
    }

    // Evaluate each claim
    const evaluations: ClaimEvaluation[] = []
    for (const claim of claims) {
        const evaluation = await evaluateClaim(claim, item)
        evaluations.push(evaluation)
    }

    // Sort by final score descending
    evaluations.sort((a, b) => b.finalScore - a.finalScore)

    const winner = evaluations[0]
    const runnerUp = evaluations[1]

    // Determine if we can auto-award
    let requiresManualReview = false
    let reason: string | undefined

    if (winner.finalScore < CONFIG.autoAwardThreshold) {
        requiresManualReview = true
        reason = `Winner confidence (${winner.finalScore}%) below threshold (${CONFIG.autoAwardThreshold}%)`
    } else if (runnerUp && (winner.finalScore - runnerUp.finalScore) < CONFIG.minimumConfidenceGap) {
        requiresManualReview = true
        reason = `Gap between top claims too small (${winner.finalScore}% vs ${runnerUp.finalScore}%)`
    } else if (winner.flags.some(f => f.severity === 'critical')) {
        requiresManualReview = true
        reason = 'Winner has critical fraud flags'
    }

    return {
        itemId: itemObjectId,
        winnerId: winner.claimantId,
        winnerClaimId: winner.claimId,
        winnerConfidence: winner.finalScore,
        evaluations,
        requiresManualReview,
        reason,
    }
}

/**
 * Process competing claims: award winner and mark others as suspicious
 */
export async function processCompetingClaims(
    itemId: Types.ObjectId | string
): Promise<CompetingClaimsResult> {
    const result = await evaluateCompetingClaims(itemId)

    if (result.evaluations.length === 0) {
        return result
    }

    const winner = result.evaluations[0]

    // Process each claim
    for (let i = 0; i < result.evaluations.length; i++) {
        const evaluation = result.evaluations[i]
        const isWinner = i === 0 && !result.requiresManualReview

        // Calculate suspicion score for non-winners
        let suspicionScore = 0
        if (!isWinner && winner) {
            // Suspicion based on confidence gap from winner
            const gap = winner.finalScore - evaluation.finalScore
            suspicionScore = Math.min(100, gap + (evaluation.flags.length * 10))
        }

        // Add flags based on suspicion score
        const flags = [...evaluation.flags]
        if (suspicionScore >= CONFIG.criticalThreshold) {
            flags.push({
                type: 'LOW_CONFIDENCE',
                severity: 'critical',
                description: `Confidence ${evaluation.finalScore}% significantly lower than winner ${winner.finalScore}%`,
            })
        } else if (suspicionScore >= CONFIG.suspiciousThreshold) {
            flags.push({
                type: 'LOW_CONFIDENCE',
                severity: 'warning',
                description: `Confidence ${evaluation.finalScore}% lower than winner ${winner.finalScore}%`,
            })
        }

        // Update claim in database
        if (isWinner) {
            await awardClaim(evaluation.claimId, evaluation.finalScore)
        } else if (suspicionScore >= CONFIG.suspiciousThreshold) {
            await markAsSuspicious(evaluation.claimId, suspicionScore, flags)
        } else {
            // Just mark as rejected without suspicious flag
            await ClaimModel.findByIdAndUpdate(evaluation.claimId, {
                status: 'rejected',
                aiConfidenceScore: evaluation.finalScore,
                fraudRisk: {
                    suspicionScore,
                    flags,
                    assessedAt: new Date(),
                },
            })
        }
    }

    return result
}

// ============ DATABASE UPDATE FUNCTIONS ============

/**
 * Award a claim as the winner
 */
async function awardClaim(claimId: Types.ObjectId, confidenceScore: number): Promise<void> {
    await ClaimModel.findByIdAndUpdate(claimId, {
        status: 'approved',
        aiConfidenceScore: confidenceScore,
        resolvedAt: new Date(),
        fraudRisk: {
            suspicionScore: 0,
            flags: [],
            assessedAt: new Date(),
        },
    })
}

/**
 * Mark a claim as suspicious
 */
export async function markAsSuspicious(
    claimId: Types.ObjectId,
    suspicionScore: number,
    flags: FraudFlag[]
): Promise<void> {
    await ClaimModel.findByIdAndUpdate(claimId, {
        status: 'suspicious',
        fraudRisk: {
            suspicionScore,
            flags,
            assessedAt: new Date(),
        },
    })
}

/**
 * Assess fraud risk for a single claim (used when claim is submitted)
 */
export async function assessClaimRisk(claimId: Types.ObjectId | string): Promise<FraudRiskAssessment> {
    const claimObjectId = typeof claimId === 'string' ? new Types.ObjectId(claimId) : claimId

    const claim = await ClaimModel.findById(claimObjectId)
        .populate('itemId') as unknown as (ClaimDocument & { itemId: ItemDocument }) | null

    if (!claim) {
        throw new Error(`Claim not found: ${claimId}`)
    }

    const item = claim.itemId as ItemDocument
    const evaluation = await evaluateClaim(
        { ...claim, itemId: item._id } as ClaimDocument,
        item
    )

    // Calculate suspicion score based on evaluation
    let suspicionScore = 0
    suspicionScore += (100 - evaluation.proofQualityScore) * 0.3
    suspicionScore += (100 - evaluation.historyScore) * 0.4
    suspicionScore += evaluation.flags.filter(f => f.severity === 'critical').length * 15
    suspicionScore += evaluation.flags.filter(f => f.severity === 'warning').length * 5
    suspicionScore = Math.min(100, Math.round(suspicionScore))

    const assessment: FraudRiskAssessment = {
        suspicionScore,
        flags: evaluation.flags,
        assessedAt: new Date(),
    }

    // Update claim with fraud risk
    await ClaimModel.findByIdAndUpdate(claimObjectId, {
        aiConfidenceScore: evaluation.finalScore,
        fraudRisk: assessment,
    })

    return assessment
}
