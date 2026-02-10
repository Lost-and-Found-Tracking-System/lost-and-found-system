import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ClaimsManagement from '../../pages/admin/Claims.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

// Mock all dependencies
vi.mock('../../services/api.js')
vi.mock('../../context/AuthContext.jsx')

// Mock AdminSidebar (not regular Sidebar!)
vi.mock('../../components/AdminSidebar.jsx', () => ({
    default: () => <div data-testid="admin-sidebar">AdminSidebar</div>
}))

// Mock GSAP hooks
vi.mock('../../hooks/useGSAPAnimations', () => ({
    usePageTransition: vi.fn(),
    useMagneticHover: vi.fn()
}))

describe('Admin Claims Management Component', () => {
    const mockAdminUser = {
        _id: 'admin-123',
        fullName: 'Admin User',
        email: 'admin@amrita.edu',
        role: 'admin'
    }

    const mockClaims = [
        {
            _id: 'claim-1',
            itemId: {
                _id: 'item-1',
                trackingId: 'ITEM-001',
                itemAttributes: {
                    category: 'Electronics',
                    description: 'iPhone'
                }
            },
            claimantId: {
                _id: 'user-1',
                fullName: 'John Doe',
                email: 'john@example.com'
            },
            status: 'pending',
            submittedAt: '2024-01-15T10:00:00Z',
            ownershipProofs: ['Receipt proof']
        }
    ]

    const mockItems = [
        {
            _id: 'item-1',
            trackingId: 'ITEM-001',
            itemAttributes: { category: 'Electronics' },
            status: 'pending',
            submittedBy: { fullName: 'User 1' }
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockAdminUser,
            loading: false
        })

        // Mock API - component defaults to 'reports' tab
        api.get.mockImplementation((url) => {
            if (url.includes('/v1/admin/claims')) {
                return Promise.resolve({ data: { claims: mockClaims, total: 1 } })
            }
            if (url.includes('/v1/admin/items')) {
                return Promise.resolve({ data: { items: mockItems, total: 1 } })
            }
            return Promise.resolve({ data: [] })
        })

        api.patch.mockResolvedValue({ data: { success: true } })
    })

    const renderAdminClaims = () => {
        return render(
            <BrowserRouter>
                <ClaimsManagement />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders admin sidebar', async () => {
            renderAdminClaims()

            await waitFor(() => {
                expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
            })
        })

        it('renders tab buttons for Claims and Reports', async () => {
            renderAdminClaims()

            await waitFor(() => {
                expect(screen.getByText('Ownership Claims')).toBeInTheDocument()
                expect(screen.getByText('Item Reports')).toBeInTheDocument()
            })
        })
    })

    describe('Tab Navigation', () => {
        it('shows Item Reports tab by default', async () => {
            renderAdminClaims()

            await waitFor(() => {
                // Default tab is 'reports'
                const reportsTab = screen.getByText('Item Reports')
                expect(reportsTab).toBeInTheDocument()
            })
        })

        it('switches to Claims tab when clicked', async () => {
            renderAdminClaims()

            await waitFor(() => screen.getByText('Ownership Claims'))

            const claimsTab = screen.getByText('Ownership Claims')
            fireEvent.click(claimsTab)

            await waitFor(() => {
                expect(api.get).toHaveBeenCalled()
            })
        })
    })
})
