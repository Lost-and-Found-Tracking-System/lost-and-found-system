// PDF Letter Generation Service
// Generates professional handover letters and claim confirmations using PDFKit

import PDFDocument from 'pdfkit'

export interface HandoverLetterData {
    itemTrackingId: string
    itemDescription: string
    itemCategory: string
    claimantName: string
    claimantEmail: string
    claimantPhone?: string
    finderName?: string // If not anonymous
    handoverDate: Date
    adminName: string
    campusZone: string
    notes?: string
}

export interface ClaimConfirmationData {
    claimId: string
    itemTrackingId: string
    itemDescription: string
    claimantName: string
    claimDate: Date
    status: 'approved' | 'rejected' | 'pending'
    adminNotes?: string
}

/**
 * Generate a professional handover letter PDF
 */
export async function generateHandoverLetter(data: HandoverLetterData): Promise<{
    buffer: Buffer
    filename: string
}> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 })
            const chunks: Buffer[] = []

            doc.on('data', (chunk: Buffer) => chunks.push(chunk))
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks)
                resolve({
                    buffer,
                    filename: `handover_${data.itemTrackingId}_${Date.now()}.pdf`,
                })
            })
            doc.on('error', reject)

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('LOST AND FOUND TRACKING SYSTEM', { align: 'center' })
            doc.moveDown(0.5)
            doc.fontSize(16).font('Helvetica-Bold').text('HANDOVER CONFIRMATION LETTER', { align: 'center' })
            doc.moveDown(0.5)

            // Horizontal line
            doc.strokeColor('#333333').lineWidth(1)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke()
            doc.moveDown(1)

            // Date and Reference
            doc.fontSize(11).font('Helvetica')
                .text(`Date: ${data.handoverDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, { continued: true })
                .text(`Reference: ${data.itemTrackingId}`, { align: 'right' })
            doc.moveDown(1.5)

            // Main content
            doc.font('Helvetica-Bold').text('TO WHOM IT MAY CONCERN:')
            doc.moveDown(0.5)
            doc.font('Helvetica')
                .text('This letter confirms the successful handover of the following item from the Lost and Found department.')
            doc.moveDown(1)

            // Item Details Box
            doc.rect(50, doc.y, 495, 80).fillAndStroke('#f5f5f5', '#cccccc')
            const boxY = doc.y + 10
            doc.fillColor('#000000')
            doc.fontSize(12).font('Helvetica-Bold').text('ITEM DETAILS', 60, boxY)
            doc.fontSize(10).font('Helvetica')
                .text(`Category: ${data.itemCategory}`, 60, boxY + 20)
                .text(`Description: ${data.itemDescription}`, 60, boxY + 35)
                .text(`Tracking ID: ${data.itemTrackingId}`, 60, boxY + 50)
                .text(`Location Found: ${data.campusZone}`, 300, boxY + 50)
            doc.moveDown(5)

            // Recipient Details Box
            doc.rect(50, doc.y, 495, 70).fillAndStroke('#f5f5f5', '#cccccc')
            const recipientY = doc.y + 10
            doc.fillColor('#000000')
            doc.fontSize(12).font('Helvetica-Bold').text('RECIPIENT DETAILS', 60, recipientY)
            doc.fontSize(10).font('Helvetica')
                .text(`Name: ${data.claimantName}`, 60, recipientY + 20)
                .text(`Email: ${data.claimantEmail}`, 60, recipientY + 35)
            if (data.claimantPhone) {
                doc.text(`Phone: ${data.claimantPhone}`, 300, recipientY + 35)
            }
            doc.moveDown(5)

            // Finder info (if not anonymous)
            if (data.finderName) {
                doc.fontSize(10).font('Helvetica-Bold').text('FINDER: ')
                doc.font('Helvetica').text(`Found by: ${data.finderName}`)
                doc.moveDown(0.5)
            }

            // Notes
            if (data.notes) {
                doc.fontSize(10).font('Helvetica-Bold').text('NOTES:')
                doc.font('Helvetica').text(data.notes)
                doc.moveDown(0.5)
            }

            doc.moveDown(1)

            // Verification Section
            doc.fontSize(11).font('Helvetica-Bold').text('VERIFICATION')
            doc.moveDown(0.3)
            doc.fontSize(10).font('Helvetica')
                .text(`I, ${data.claimantName}, confirm that I have received the item described above and that it belongs to me.`)
            doc.moveDown(1.5)

            // Signature lines
            doc.text('Claimant Signature: _______________________________', 60)
            doc.moveDown(0.5)
            doc.text('Date: _______________', 60)
            doc.moveDown(1.5)

            doc.fontSize(11).font('Helvetica-Bold').text('ADMIN VERIFICATION')
            doc.moveDown(0.3)
            doc.fontSize(10).font('Helvetica')
                .text(`Processed by: ${data.adminName}`)
                .text(`Date: ${data.handoverDate.toLocaleDateString('en-IN')}`)
            doc.moveDown(1)
            doc.text('Admin Signature: _______________________________', 60)

            // Footer
            doc.moveDown(2)
            doc.strokeColor('#333333').lineWidth(0.5)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke()
            doc.moveDown(0.5)
            doc.fontSize(8).fillColor('#666666')
                .text('This document was generated by the Lost and Found Tracking System.', { align: 'center' })
                .text('For any queries, please contact the campus lost and found office.', { align: 'center' })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Generate a claim confirmation PDF
 */
export async function generateClaimConfirmation(data: ClaimConfirmationData): Promise<{
    buffer: Buffer
    filename: string
}> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 })
            const chunks: Buffer[] = []

            doc.on('data', (chunk: Buffer) => chunks.push(chunk))
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks)
                resolve({
                    buffer,
                    filename: `claim_${data.claimId}_${Date.now()}.pdf`,
                })
            })
            doc.on('error', reject)

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('LOST AND FOUND TRACKING SYSTEM', { align: 'center' })
            doc.moveDown(0.5)
            doc.fontSize(16).font('Helvetica-Bold').text('CLAIM CONFIRMATION', { align: 'center' })
            doc.moveDown(0.5)

            // Horizontal line
            doc.strokeColor('#333333').lineWidth(1)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke()
            doc.moveDown(1)

            // Reference info
            doc.fontSize(10).font('Helvetica')
                .text(`Claim Reference: ${data.claimId}`)
                .text(`Item Reference: ${data.itemTrackingId}`)
                .text(`Date: ${data.claimDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`)
            doc.moveDown(1)

            // Status badge
            const statusColors = {
                approved: { bg: '#d1fae5', text: '#065f46', label: 'APPROVED' },
                rejected: { bg: '#fee2e2', text: '#991b1b', label: 'REJECTED' },
                pending: { bg: '#fef3c7', text: '#92400e', label: 'PENDING REVIEW' },
            }
            const status = statusColors[data.status]

            doc.rect(50, doc.y, 150, 30).fill(status.bg)
            doc.fillColor(status.text).fontSize(14).font('Helvetica-Bold')
                .text(status.label, 60, doc.y - 25 + 8)
            doc.fillColor('#000000')
            doc.moveDown(2)

            // Status messages
            const statusMessages = {
                approved: 'Your claim has been approved! Please visit the Lost and Found office to collect your item.',
                rejected: 'Unfortunately, your claim could not be approved. Please contact the Lost and Found office for more information.',
                pending: 'Your claim is currently being reviewed. You will be notified once a decision has been made.',
            }

            doc.fontSize(11).font('Helvetica').text(statusMessages[data.status])
            doc.moveDown(1)

            // Claimant info
            doc.fontSize(11).font('Helvetica-Bold').text('CLAIMANT')
            doc.fontSize(10).font('Helvetica').text(data.claimantName)
            doc.moveDown(1)

            // Item description
            doc.fontSize(11).font('Helvetica-Bold').text('ITEM DESCRIPTION')
            doc.fontSize(10).font('Helvetica').text(data.itemDescription)
            doc.moveDown(1)

            // Admin notes
            if (data.adminNotes) {
                doc.fontSize(11).font('Helvetica-Bold').text('ADMINISTRATOR NOTES')
                doc.fontSize(10).font('Helvetica').text(data.adminNotes)
                doc.moveDown(1)
            }

            // Footer
            doc.moveDown(2)
            doc.strokeColor('#333333').lineWidth(0.5)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke()
            doc.moveDown(0.5)
            doc.fontSize(8).fillColor('#666666')
                .text('This document was generated by the Lost and Found Tracking System.', { align: 'center' })
                .text('Please present this document when collecting your item.', { align: 'center' })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Generate a text-based letter (fallback for development)
 */
export function generateTextLetter(data: HandoverLetterData): string {
    return `
LOST AND FOUND TRACKING SYSTEM
HANDOVER CONFIRMATION LETTER
----------------------------------------

Date: ${data.handoverDate.toLocaleDateString()}
Reference: ${data.itemTrackingId}

TO WHOM IT MAY CONCERN:

This letter confirms the handover of the following item:

ITEM DETAILS:
- Category: ${data.itemCategory}
- Description: ${data.itemDescription}
- Tracking ID: ${data.itemTrackingId}
- Location Found: ${data.campusZone}

RECIPIENT DETAILS:
- Name: ${data.claimantName}
- Email: ${data.claimantEmail}
${data.claimantPhone ? `- Phone: ${data.claimantPhone}` : ''}

${data.finderName ? `FINDER:\n- Found by: ${data.finderName}\n` : ''}

${data.notes ? `NOTES:\n${data.notes}\n` : ''}

VERIFICATION:
I, ${data.claimantName}, confirm receipt of the item.

Processed by: ${data.adminName}
Date: ${data.handoverDate.toLocaleDateString()}

----------------------------------------
Lost and Found Tracking System
`
}
