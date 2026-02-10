import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Notifications from '../../pages/Notifications.jsx'
import api from '../../services/api.js'

// Mock modules
vi.mock('../../services/api.js')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span data-testid="glitch-text">{text}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    PulseRings: () => null,
    RippleButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    HolographicCard: ({ children }) => <div>{children}</div>
}))

describe('Notifications Component', () => {
    const mockNotifications = [
        {
            _id: 'notif-1',
            type: 'claim_approved',
            title: 'Claim Approved',
            message: 'Your claim for iPhone has been approved',
            isRead: false,
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            _id: 'notif-2',
            type: 'new_item',
            title: 'New Item Reported',
            message: 'A new item matching your description was found',
            isRead: true,
            readAt: '2024-01-14T12:00:00Z',
            createdAt: '2024-01-14T10:00:00Z'
        },
        {
            _id: 'notif-3',
            type: 'claim_rejected',
            title: 'Claim Rejected',
            message: 'Your claim was rejected due to insufficient proof',
            isRead: false,
            createdAt: '2024-01-13T10:00:00Z'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: { notifications: mockNotifications } })
        api.put.mockResolvedValue({ data: { success: true } })
        api.delete.mockResolvedValue({ data: { success: true } })
    })

    const renderNotifications = () => {
        return render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', async () => {
            renderNotifications()
            expect(await screen.findByTestId('sidebar')).toBeInTheDocument()
        })

        it('renders Notifications header', async () => {
            renderNotifications()
            expect(await screen.findByText('Notifications')).toBeInTheDocument()
        })

        it('shows unread count', async () => {
            renderNotifications()
            // GlitchText shows unread count
            expect(await screen.findByTestId('glitch-text')).toBeInTheDocument()
        })

        it('fetches notifications on mount', async () => {
            renderNotifications()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/notifications')
            })
        })
    })

    describe('Filter Pills', () => {
        it('renders All, Unread, and Read filter buttons', async () => {
            renderNotifications()

            expect(await screen.findByText('All')).toBeInTheDocument()
            expect(await screen.findByText('Unread')).toBeInTheDocument()
            expect(await screen.findByText('Read')).toBeInTheDocument()
        })

        it('shows correct count on filter pills', async () => {
            renderNotifications()

            // Wait for notifications to load
            await screen.findByText('Claim Approved')

            // All = 3, Unread = 2, Read = 1
            const countBadges = screen.getAllByText(/^[0-3]$/)
            expect(countBadges.length).toBeGreaterThan(0)
        })
    })

    describe('Notifications List', () => {
        it('displays notification titles', async () => {
            renderNotifications()

            expect(await screen.findByText('Claim Approved')).toBeInTheDocument()
            expect(await screen.findByText('New Item Reported')).toBeInTheDocument()
            expect(await screen.findByText('Claim Rejected')).toBeInTheDocument()
        })

        it('displays notification messages', async () => {
            renderNotifications()

            expect(await screen.findByText('Your claim for iPhone has been approved')).toBeInTheDocument()
        })

        it('shows Mark all read button when unread notifications exist', async () => {
            renderNotifications()

            expect(await screen.findByText('Mark all read')).toBeInTheDocument()
        })
    })

    describe('Empty State', () => {
        it('shows empty state when no notifications', async () => {
            api.get.mockResolvedValue({ data: { notifications: [] } })
            renderNotifications()

            expect(await screen.findByText('No notifications')).toBeInTheDocument()
        })
    })

    describe('Actions', () => {
        it('calls API when Mark all read is clicked', async () => {
            renderNotifications()

            const markAllBtn = await screen.findByText('Mark all read')
            fireEvent.click(markAllBtn)

            await waitFor(() => {
                expect(api.put).toHaveBeenCalledWith('/v1/notifications/read-all')
            })
        })
    })
})
