import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Profile from '../../pages/Profile.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

// Mock effects - GlitchText receives text prop, NeonText receives children
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span data-testid="glitch-text">{text}</span>,
    NeonText: ({ children }) => <span data-testid="neon-text">{children}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className, disabled }) => (
        <button onClick={onClick} className={className} disabled={disabled}>{children}</button>
    ),
    PulseRings: () => null,
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    HolographicCard: ({ children }) => <div>{children}</div>
}))

vi.mock('../../services/api.js')
vi.mock('../../context/AuthContext.jsx')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('Profile Component', () => {
    const mockUser = {
        _id: 'user-123',
        fullName: 'John Doe',
        email: 'john@amrita.edu',
        phone: '9876543210',
        role: 'student',
        institutionalId: 'STU001',
        createdAt: '2024-01-01T00:00:00Z'
    }

    const mockUpdateProfile = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockUser,
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
            updateProfile: mockUpdateProfile
        })

        api.get.mockResolvedValue({
            data: { totalReported: 5, totalClaims: 3, resolvedItems: 2 }
        })
    })

    const renderProfile = () => {
        return render(
            <BrowserRouter>
                <Profile />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', () => {
            renderProfile()
            expect(screen.getByTestId('sidebar')).toBeInTheDocument()
        })

        it('displays user full name via GlitchText', async () => {
            renderProfile()

            // GlitchText renders user.fullName via text prop
            await waitFor(() => {
                const glitchTexts = screen.getAllByTestId('glitch-text')
                const hasName = glitchTexts.some(el => el.textContent.includes('John Doe'))
                expect(hasName).toBe(true)
            })
        })

        it('displays user email', async () => {
            renderProfile()

            await waitFor(() => {
                expect(screen.getByText('john@amrita.edu')).toBeInTheDocument()
            })
        })

        it('displays user role via NeonText', async () => {
            renderProfile()

            // NeonText renders user.role
            await waitFor(() => {
                const neonTexts = screen.getAllByTestId('neon-text')
                const hasRole = neonTexts.some(el => el.textContent.includes('student'))
                expect(hasRole).toBe(true)
            })
        })

        it('fetches user stats on mount', async () => {
            renderProfile()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/dashboard/stats')
            })
        })
    })
})
