import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ZoneManagement from '../../../pages/admin/ZoneManagement.jsx'
import * as AuthContext from '../../../context/AuthContext.jsx'
import api from '../../../services/api.js'

// Mock modules
vi.mock('../../../services/api.js')
vi.mock('../../../context/AuthContext.jsx')
vi.mock('../../../components/AdminSidebar.jsx', () => ({
    default: () => <div data-testid="admin-sidebar">AdminSidebar</div>
}))
vi.mock('../../../hooks/useGSAPAnimations', () => ({
    usePageTransition: vi.fn(),
    useMagneticHover: vi.fn(),
    use3DTilt: vi.fn()
}))

describe('ZoneManagement Component', () => {
    const mockZones = [
        {
            _id: 'zone-1',
            zoneName: 'Central Library',
            description: 'Main library building',
            zoneType: 'building',
            geoBoundary: { type: 'Polygon', coordinates: [[]] }
        },
        {
            _id: 'zone-2',
            zoneName: 'Sports Ground',
            description: 'Outdoor sports area',
            zoneType: 'outdoor',
            geoBoundary: { type: 'Polygon', coordinates: [[]] }
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: { id: 'admin-1', role: 'admin' },
            logout: vi.fn()
        })

        api.get.mockResolvedValue({ data: mockZones })
        api.post.mockResolvedValue({ data: { success: true } })
        api.put.mockResolvedValue({ data: { success: true } })
        api.delete.mockResolvedValue({ data: { success: true } })
    })

    const renderZoneManagement = () => {
        return render(
            <BrowserRouter>
                <ZoneManagement />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders admin sidebar', async () => {
            renderZoneManagement()
            expect(await screen.findByTestId('admin-sidebar')).toBeInTheDocument()
        })

        it('renders Campus Zones header', async () => {
            renderZoneManagement()
            expect(await screen.findByText('Campus Zones')).toBeInTheDocument()
        })

        it('renders Create New Zone button', async () => {
            renderZoneManagement()
            expect(await screen.findByText('Create New Zone')).toBeInTheDocument()
        })

        it('fetches zones on mount', async () => {
            renderZoneManagement()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/zones')
            })
        })
    })

    describe('Zone Cards', () => {
        it('displays zone names', async () => {
            renderZoneManagement()

            expect(await screen.findByText('Central Library')).toBeInTheDocument()
            expect(await screen.findByText('Sports Ground')).toBeInTheDocument()
        })

        it('displays zone descriptions', async () => {
            renderZoneManagement()

            expect(await screen.findByText('Main library building')).toBeInTheDocument()
            expect(await screen.findByText('Outdoor sports area')).toBeInTheDocument()
        })

        it('displays zone type labels', async () => {
            renderZoneManagement()

            expect(await screen.findByText('Building')).toBeInTheDocument()
            expect(await screen.findByText('Outdoor')).toBeInTheDocument()
        })
    })

    describe('Empty State', () => {
        it('shows No Zones Configured when no zones', async () => {
            api.get.mockResolvedValue({ data: [] })
            renderZoneManagement()

            expect(await screen.findByText('No Zones Configured')).toBeInTheDocument()
        })

        it('shows Create First Zone button in empty state', async () => {
            api.get.mockResolvedValue({ data: [] })
            renderZoneManagement()

            expect(await screen.findByText('Create First Zone')).toBeInTheDocument()
        })
    })

    describe('Create Zone Form', () => {
        it('shows form when Create New Zone is clicked', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            expect(await screen.findByText('Configure New Zone')).toBeInTheDocument()
        })

        it('renders Zone Name input in form', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            expect(await screen.findByText('Zone Name')).toBeInTheDocument()
            expect(await screen.findByPlaceholderText(/Central Library/i)).toBeInTheDocument()
        })

        it('renders Zone Type buttons in form', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            expect(await screen.findByText('Zone Type')).toBeInTheDocument()
        })

        it('renders Cancel and Save buttons in form', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            expect(await screen.findByText('Cancel')).toBeInTheDocument()
            expect(await screen.findByText('Save Zone')).toBeInTheDocument()
        })
    })

    describe('Save Zone', () => {
        it('shows error when zone name is empty', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            const saveBtn = await screen.findByText('Save Zone')
            fireEvent.click(saveBtn)

            expect(await screen.findByText('Zone name is required')).toBeInTheDocument()
        })

        it('calls API when saving valid zone', async () => {
            renderZoneManagement()

            const createBtn = await screen.findByText('Create New Zone')
            fireEvent.click(createBtn)

            const nameInput = await screen.findByPlaceholderText(/Central Library/i)
            fireEvent.change(nameInput, { target: { value: 'New Zone' } })

            const saveBtn = await screen.findByText('Save Zone')
            fireEvent.click(saveBtn)

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/v1/zones', expect.objectContaining({
                    zoneName: 'New Zone'
                }))
            })
        })
    })
})
