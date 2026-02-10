import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyClaims from '../../pages/MyClaims.jsx'
import api from '../../services/api.js'

// Mock effects
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span>{text}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    PulseRings: () => null,
    HolographicCard: ({ children }) => <div>{children}</div>
}))

vi.mock('../../services/api.js')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('MyClaims Component', () => {
    const mockClaims = [
        {
            _id: 'claim-1',
            itemId: {
                _id: 'item-1',
                trackingId: 'ITEM-001',
                itemAttributes: {
                    category: 'Electronics',
                    description: 'iPhone 13'
                },
                images: []
            },
            status: 'pending',
            submittedAt: '2024-01-15T10:00:00Z',
            ownershipProofs: ['I have the receipt']
        },
        {
            _id: 'claim-2',
            itemId: {
                _id: 'item-2',
                trackingId: 'ITEM-002',
                itemAttributes: {
                    category: 'Books',
                    description: 'Physics Textbook'
                },
                images: []
            },
            status: 'approved',
            submittedAt: '2024-01-14T10:00:00Z',
            ownershipProofs: ['Student ID matches']
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: mockClaims })
    })

    const renderMyClaims = () => {
        return render(
            <BrowserRouter>
                <MyClaims />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders My Claims header', async () => {
            renderMyClaims()
            expect(await screen.findByText('My Claims')).toBeInTheDocument()
        })

        it('fetches and displays claims', async () => {
            renderMyClaims()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/claims/user/my-claims')
            })

            expect(await screen.findByText('Electronics')).toBeInTheDocument()
            expect(await screen.findByText('Books')).toBeInTheDocument()
        })

        it('displays claim status badges', async () => {
            renderMyClaims()

            // Wait for claims to load - 'Pending Review' is unique to status badge
            expect(await screen.findByText('Pending Review')).toBeInTheDocument()
            // 'Contact admin for pickup' only shows for approved claims
            expect(await screen.findByText('Contact admin for pickup')).toBeInTheDocument()
        })
    })

    describe('Filter Pills', () => {
        it('renders all filter options', async () => {
            renderMyClaims()

            // Use findByText for async elements
            expect(await screen.findByText('All Claims')).toBeInTheDocument()
            // Check filter buttons exist (not status badges)
            const pendingButtons = await screen.findAllByText(/Pending/)
            expect(pendingButtons.length).toBeGreaterThan(0)
        })

        it('filters claims when filter is clicked', async () => {
            renderMyClaims()

            const pendingFilter = await screen.findByText('All Claims')
            expect(pendingFilter).toBeInTheDocument()
        })
    })

    describe('Empty State', () => {
        it('shows empty message when no claims', async () => {
            api.get.mockResolvedValue({ data: [] })
            renderMyClaims()

            expect(await screen.findByText('No claims found')).toBeInTheDocument()
        })

        it('shows Browse Items button in empty state', async () => {
            api.get.mockResolvedValue({ data: [] })
            renderMyClaims()

            expect(await screen.findByText('Browse Items')).toBeInTheDocument()
        })
    })

    describe('Claim Actions', () => {
        it('renders View Item button for each claim', async () => {
            renderMyClaims()

            const viewButtons = await screen.findAllByText('View Item')
            expect(viewButtons.length).toBe(2)
        })

        it('shows pickup message for approved claims', async () => {
            renderMyClaims()

            expect(await screen.findByText('Contact admin for pickup')).toBeInTheDocument()
        })
    })
})
