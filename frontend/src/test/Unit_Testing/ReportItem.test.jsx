import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ReportItem from '../../pages/ReportItem.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'
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
    WaveText: ({ text }) => <span>{text}</span>
}))

vi.mock('../../services/api.js')
vi.mock('../../context/AuthContext.jsx')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('ReportItem Component', () => {
    const mockUser = {
        _id: 'user-123',
        fullName: 'Test User',
        email: 'test@amrita.edu',
        role: 'student'
    }

    const mockZones = [
        { _id: 'zone-1', zoneName: 'Main Library', buildings: ['Block A'] },
        { _id: 'zone-2', zoneName: 'Cafeteria', buildings: ['Main Building'] }
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockUser,
            loading: false
        })

        api.get.mockResolvedValue({ data: mockZones })
        api.post.mockResolvedValue({ data: { _id: 'new-item-123' } })
    })

    const renderReportItem = () => {
        return render(
            <BrowserRouter>
                <ReportItem />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', () => {
            renderReportItem()
            expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        })

        it('fetches zones on mount', async () => {
            renderReportItem()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/zones')
            })
        })
    })
})
