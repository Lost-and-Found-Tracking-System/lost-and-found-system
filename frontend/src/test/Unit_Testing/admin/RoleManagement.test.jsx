import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RoleManagement from '../../../pages/admin/RoleManagement.jsx'
import api from '../../../services/api.js'

// Mock modules
vi.mock('../../../services/api.js')
vi.mock('../../../components/AdminSidebar.jsx', () => ({
    default: () => <div data-testid="admin-sidebar">AdminSidebar</div>
}))
vi.mock('../../../hooks/useGSAPAnimations', () => ({
    usePageTransition: vi.fn(),
    useMagneticHover: vi.fn()
}))

describe('RoleManagement Component', () => {
    const mockUsers = [
        {
            _id: 'user-1',
            role: 'student',
            status: 'active',
            profile: { fullName: 'John Doe', email: 'john@example.com' },
            institutionalId: 'STU001',
            createdAt: '2024-01-01T00:00:00Z'
        },
        {
            _id: 'user-2',
            role: 'faculty',
            status: 'active',
            profile: { fullName: 'Jane Smith', email: 'jane@example.com' },
            institutionalId: 'FAC001',
            createdAt: '2024-01-02T00:00:00Z'
        },
        {
            _id: 'user-3',
            role: 'admin',
            status: 'active',
            profile: { fullName: 'Admin User', email: 'admin@example.com' },
            createdAt: '2024-01-03T00:00:00Z'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: { users: mockUsers } })
        api.put.mockResolvedValue({ data: { success: true } })
    })

    const renderRoleManagement = () => {
        return render(
            <BrowserRouter>
                <RoleManagement />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders admin sidebar', async () => {
            renderRoleManagement()
            expect(await screen.findByTestId('admin-sidebar')).toBeInTheDocument()
        })

        it('renders User Permissions header', async () => {
            renderRoleManagement()
            expect(await screen.findByText('User Permissions')).toBeInTheDocument()
        })

        it('renders Back to Dashboard link', async () => {
            renderRoleManagement()
            expect(await screen.findByText(/Back to Dashboard/i)).toBeInTheDocument()
        })

        it('renders user count badge', async () => {
            renderRoleManagement()
            expect(await screen.findByText(/Users Total/i)).toBeInTheDocument()
        })
    })

    describe('Search and Filters', () => {
        it('renders search input', async () => {
            renderRoleManagement()
            expect(await screen.findByPlaceholderText(/Search by name, email, or ID/i)).toBeInTheDocument()
        })

        it('renders role filter buttons', async () => {
            renderRoleManagement()

            expect(await screen.findByText('all')).toBeInTheDocument()
            expect(await screen.findByText('student')).toBeInTheDocument()
            expect(await screen.findByText('faculty')).toBeInTheDocument()
            expect(await screen.findByText('visitor')).toBeInTheDocument()
            expect(await screen.findByText('admin')).toBeInTheDocument()
        })

        it('fetches users on mount', async () => {
            renderRoleManagement()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/admin/users')
            })
        })

        it('filters users when role filter is clicked', async () => {
            renderRoleManagement()

            const studentFilter = await screen.findByText('student')
            fireEvent.click(studentFilter)

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/admin/users?role=student')
            })
        })
    })

    describe('User Cards', () => {
        it('displays user names', async () => {
            renderRoleManagement()

            expect(await screen.findByText('John Doe')).toBeInTheDocument()
            expect(await screen.findByText('Jane Smith')).toBeInTheDocument()
            expect(await screen.findByText('Admin User')).toBeInTheDocument()
        })

        it('displays Modify Access button', async () => {
            renderRoleManagement()

            const modifyButtons = await screen.findAllByText('Modify Access')
            expect(modifyButtons.length).toBe(3)
        })

        it('displays Status label', async () => {
            renderRoleManagement()

            const statusLabels = await screen.findAllByText('Status')
            expect(statusLabels.length).toBeGreaterThan(0)
        })
    })

    describe('Empty State', () => {
        it('shows No users found when no users match search', async () => {
            api.get.mockResolvedValue({ data: { users: [] } })
            renderRoleManagement()

            expect(await screen.findByText('No users found')).toBeInTheDocument()
        })
    })

    describe('Role Editing', () => {
        it('shows edit form when Modify Access is clicked', async () => {
            renderRoleManagement()

            const modifyButtons = await screen.findAllByText('Modify Access')
            fireEvent.click(modifyButtons[0])

            expect(await screen.findByText('New Role')).toBeInTheDocument()
            expect(await screen.findByText('Reason for Change')).toBeInTheDocument()
        })

        it('shows Cancel and Save buttons in edit mode', async () => {
            renderRoleManagement()

            const modifyButtons = await screen.findAllByText('Modify Access')
            fireEvent.click(modifyButtons[0])

            expect(await screen.findByText('Cancel')).toBeInTheDocument()
            expect(await screen.findByText('Save')).toBeInTheDocument()
        })
    })
})
