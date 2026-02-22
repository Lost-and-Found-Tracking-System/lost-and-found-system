import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SubmitClaim from '../../pages/SubmitClaim.jsx'
import api from '../../services/api.js'

// Mock effects
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span>{text}</span>,
    NeonText: ({ children }) => <span>{children}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className, disabled }) => (
        <button onClick={onClick} className={className} disabled={disabled}>{children}</button>
    ),
    PulseRings: () => null,
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    WaveText: ({ text }) => <span>{text}</span>,
    HolographicCard: ({ children }) => <div>{children}</div>
}))

vi.mock('../../services/api.js')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('SubmitClaim Component', () => {
    const mockItem = {
        _id: 'item-456',
        trackingId: 'ITEM-001',
        itemAttributes: {
            category: 'Electronics',
            description: 'iPhone 13 Pro Max'
        },
        status: 'submitted',
        images: [],
        location: { zoneId: { zoneName: 'Library' } }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: mockItem })
        api.post.mockResolvedValue({ data: { success: true } })
    })

    const renderSubmitClaim = () => {
        return render(
            <MemoryRouter initialEntries={['/items/item-456/claim']}>
                <Routes>
                    <Route path="/items/:itemId/claim" element={<SubmitClaim />} />
                </Routes>
            </MemoryRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', async () => {
            renderSubmitClaim()

            await waitFor(() => {
                expect(screen.getByTestId('sidebar')).toBeInTheDocument()
            })
        })

        it('fetches item details on mount', async () => {
            renderSubmitClaim()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/items/item-456')
            })
        })

        it('displays item category', async () => {
            renderSubmitClaim()

            await waitFor(() => {
                expect(screen.getByText(/Electronics/i)).toBeInTheDocument()
            })
        })
    })

    describe('Error Handling', () => {
        it('shows error state when item not found', async () => {
            api.get.mockRejectedValue(new Error('Not found'))
            renderSubmitClaim()

            await waitFor(() => {
                expect(screen.getByText(/Item Not Found/i)).toBeInTheDocument()
            })
        })
    })
})
