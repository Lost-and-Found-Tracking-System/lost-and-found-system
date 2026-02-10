import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ItemDetails from '../../pages/ItemDetails.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

// Mock effects
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span>{text}</span>,
    NeonText: ({ children }) => <span>{children}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    PulseRings: () => null,
    HolographicCard: ({ children }) => <div>{children}</div>,
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    RippleButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    )
}))

vi.mock('../../services/api.js')
vi.mock('../../context/AuthContext.jsx')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('ItemDetails Component', () => {
    const mockUser = {
        _id: 'user-456',
        fullName: 'Test User',
        role: 'student'
    }

    const mockItem = {
        _id: 'item-123',
        trackingId: 'ITEM-001',
        submissionType: 'lost',
        status: 'submitted',
        itemAttributes: {
            category: 'Electronics',
            description: 'Black iPhone 13 Pro'
        },
        location: {
            zoneId: { zoneName: 'Main Library' }
        },
        submittedBy: {
            _id: 'other-user',
            fullName: 'John Doe'
        },
        images: [],
        createdAt: '2024-01-15T10:00:00Z',
        views: 10
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockUser,
            loading: false
        })

        api.get.mockResolvedValue({ data: mockItem })
    })

    const renderItemDetails = () => {
        return render(
            <MemoryRouter initialEntries={['/item/item-123']}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', async () => {
            renderItemDetails()

            await waitFor(() => {
                expect(screen.getByTestId('sidebar')).toBeInTheDocument()
            })
        })

        it('fetches item details on mount', async () => {
            renderItemDetails()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/items/item-123')
            })
        })

        it('displays item category in heading', async () => {
            renderItemDetails()

            // Category is displayed as h1 title
            await waitFor(() => {
                const headings = screen.getAllByRole('heading', { level: 1 })
                const hasCategory = headings.some(h => h.textContent.includes('Electronics'))
                expect(hasCategory).toBe(true)
            })
        })

        it('displays item description', async () => {
            renderItemDetails()

            await waitFor(() => {
                expect(screen.getByText(/Black iPhone 13 Pro/i)).toBeInTheDocument()
            })
        })

        it('displays item location', async () => {
            renderItemDetails()

            await waitFor(() => {
                expect(screen.getByText('Main Library')).toBeInTheDocument()
            })
        })
    })
})
