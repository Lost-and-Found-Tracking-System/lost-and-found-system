import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminDashboard from '../../../pages/admin/Dashboard.jsx'
import * as AuthContext from '../../../context/AuthContext.jsx'
import api from '../../../services/api.js'

// Mock modules
vi.mock('../../../services/api.js')
vi.mock('../../../context/AuthContext.jsx')
vi.mock('../../../components/AdminSidebar.jsx', () => ({
    default: () => <div data-testid="admin-sidebar">AdminSidebar</div>
}))
vi.mock('../../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span data-testid="glitch-text">{text}</span>,
    NeonText: ({ children }) => <span>{children}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    HolographicCard: ({ children }) => <div>{children}</div>,
    PulseRings: () => null,
    ElasticButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    GradientFlowText: ({ children }) => <span>{children}</span>,
    ParticleExplosion: ({ children }) => <div>{children}</div>
}))

describe('AdminDashboard Component', () => {
    const mockStats = {
        totalUsers: 150,
        totalItems: 320,
        pendingClaims: 12,
        resolvedItems: 98,
        matchRate: 87,
        avgResponseTime: 2.4
    }

    const mockActivity = [
        {
            type: 'claim',
            actionType: 'claim_approved',
            message: 'Claim approved for iPhone',
            user: { fullName: 'Admin User' },
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            type: 'item',
            actionType: 'new_item',
            message: 'New item reported: Laptop',
            user: { fullName: 'John Doe' },
            createdAt: '2024-01-15T09:30:00Z'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { id: 'admin-1', fullName: 'Admin User', role: 'admin' },
            loading: false
        })

        api.get.mockImplementation((url) => {
            if (url.includes('/admin/stats')) {
                return Promise.resolve({ data: mockStats })
            }
            if (url.includes('/admin/activity')) {
                return Promise.resolve({ data: { activities: mockActivity } })
            }
            return Promise.resolve({ data: {} })
        })
    })

    const renderAdminDashboard = () => {
        return render(
            <BrowserRouter>
                <AdminDashboard />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders admin sidebar', async () => {
            renderAdminDashboard()
            expect(await screen.findByTestId('admin-sidebar')).toBeInTheDocument()
        })

        it('renders Dashboard header', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('Dashboard')).toBeInTheDocument()
        })

        it('renders Admin Portal badge', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('Admin Portal')).toBeInTheDocument()
        })

        it('renders All Systems Online status', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('All Systems Online')).toBeInTheDocument()
        })
    })

    describe('Stats Cards', () => {
        it('renders stat card labels', async () => {
            renderAdminDashboard()

            expect(await screen.findByText('Total Users')).toBeInTheDocument()
            expect(await screen.findByText('Total Items')).toBeInTheDocument()
            expect(await screen.findByText('Active Claims')).toBeInTheDocument()
            expect(await screen.findByText('Resolved')).toBeInTheDocument()
            expect(await screen.findByText('Match Rate')).toBeInTheDocument()
            expect(await screen.findByText('Avg. Response')).toBeInTheDocument()
        })

        it('fetches stats on mount', async () => {
            renderAdminDashboard()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/admin/stats')
            })
        })
    })

    describe('Activity Feed', () => {
        it('renders Live Activity Feed header', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('Live Activity Feed')).toBeInTheDocument()
        })

        it('renders View all link', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('View all')).toBeInTheDocument()
        })

        it('fetches activity on mount', async () => {
            renderAdminDashboard()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/admin/activity?limit=15')
            })
        })

        it('shows empty state when no activity', async () => {
            api.get.mockImplementation((url) => {
                if (url.includes('/admin/activity')) {
                    return Promise.resolve({ data: { activities: [] } })
                }
                return Promise.resolve({ data: mockStats })
            })

            renderAdminDashboard()
            expect(await screen.findByText('No recent activity')).toBeInTheDocument()
        })
    })

    describe('Quick Access Links', () => {
        it('renders Quick Access header', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('Quick Access')).toBeInTheDocument()
        })

        it('renders quick access links', async () => {
            renderAdminDashboard()

            expect(await screen.findByText('Manage Claims')).toBeInTheDocument()
            expect(await screen.findByText('User Management')).toBeInTheDocument()
            expect(await screen.findByText('Zone Settings')).toBeInTheDocument()
            expect(await screen.findByText('AI Configuration')).toBeInTheDocument()
        })
    })

    describe('System Health', () => {
        it('renders System Health header', async () => {
            renderAdminDashboard()
            expect(await screen.findByText('System Health')).toBeInTheDocument()
        })

        it('renders health metrics', async () => {
            renderAdminDashboard()

            expect(await screen.findByText('API Response')).toBeInTheDocument()
            expect(await screen.findByText('Database')).toBeInTheDocument()
            expect(await screen.findByText('AI Model')).toBeInTheDocument()
        })
    })
})
