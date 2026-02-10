import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar.jsx'
import * as AuthContext from '../../../context/AuthContext.jsx'

// Mock modules
vi.mock('../../../context/AuthContext.jsx')
vi.mock('../../../components/LogoutConfirmModal.jsx', () => ({
    default: ({ isOpen, onClose, onConfirm }) => isOpen ? (
        <div data-testid="logout-modal">
            <button onClick={onClose}>Cancel</button>
            <button onClick={onConfirm}>Confirm Logout</button>
        </div>
    ) : null
}))

describe('Sidebar Component', () => {
    const mockLogout = vi.fn()
    const mockUser = {
        fullName: 'John Doe',
        role: 'student',
        email: 'john@example.com'
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockUser,
            logout: mockLogout,
            loading: false
        })
    })

    const renderSidebar = (initialPath = '/dashboard') => {
        return render(
            <MemoryRouter initialEntries={[initialPath]}>
                <Sidebar />
            </MemoryRouter>
        )
    }

    describe('Rendering', () => {
        it('renders the sidebar', () => {
            renderSidebar()
            expect(document.querySelector('aside')).toBeInTheDocument()
        })

        it('renders L&F branding when expanded', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('&')).toBeInTheDocument()
        })
    })

    describe('Navigation Links', () => {
        it('renders Dashboard link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Dashboard')).toBeInTheDocument()
        })

        it('renders Report Item link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Report Item')).toBeInTheDocument()
        })

        it('renders Browse Items link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Browse Items')).toBeInTheDocument()
        })

        it('renders My Claims link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('My Claims')).toBeInTheDocument()
        })

        it('renders Notifications link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Notifications')).toBeInTheDocument()
        })

        it('renders Profile link', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Profile')).toBeInTheDocument()
        })
    })

    describe('User Info', () => {
        it('displays user name when expanded', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        it('displays user role when expanded', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('student')).toBeInTheDocument()
        })
    })

    describe('Admin Link', () => {
        it('shows Admin Panel for admin users', () => {
            vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
                user: { ...mockUser, role: 'admin' },
                logout: mockLogout,
                loading: false
            })

            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Admin Panel')).toBeInTheDocument()
        })

        it('does not show Admin Panel for regular users', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
        })
    })

    describe('Logout', () => {
        it('renders Logout button when expanded', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Logout')).toBeInTheDocument()
        })

        it('shows logout modal when Logout is clicked', () => {
            renderSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            const logoutBtn = screen.getByText('Logout')
            fireEvent.click(logoutBtn)

            expect(screen.getByTestId('logout-modal')).toBeInTheDocument()
        })
    })
})
