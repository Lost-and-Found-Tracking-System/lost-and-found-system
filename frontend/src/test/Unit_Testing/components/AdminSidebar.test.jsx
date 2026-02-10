import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import AdminSidebar from '../../../components/AdminSidebar.jsx'
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

describe('AdminSidebar Component', () => {
    const mockLogout = vi.fn()
    const mockUser = {
        fullName: 'Admin User',
        role: 'admin',
        email: 'admin@example.com'
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: mockUser,
            logout: mockLogout,
            loading: false
        })
    })

    const renderAdminSidebar = (initialPath = '/admin') => {
        return render(
            <MemoryRouter initialEntries={[initialPath]}>
                <AdminSidebar />
            </MemoryRouter>
        )
    }

    describe('Rendering', () => {
        it('renders the sidebar', () => {
            renderAdminSidebar()
            expect(document.querySelector('aside')).toBeInTheDocument()
        })

        it('renders Admin Portal text when expanded', () => {
            renderAdminSidebar()
            // Hover to expand
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Admin Portal')).toBeInTheDocument()
        })

        it('renders LOST & FOUND branding', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('LOST & FOUND')).toBeInTheDocument()
        })
    })

    describe('Navigation Links', () => {
        it('renders Admin Dashboard link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
        })

        it('renders Claims Management link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Claims Management')).toBeInTheDocument()
        })

        it('renders User Management link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('User Management')).toBeInTheDocument()
        })

        it('renders Zone Management link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Zone Management')).toBeInTheDocument()
        })

        it('renders AI Configuration link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('AI Configuration')).toBeInTheDocument()
        })

        it('renders User App link', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('User App')).toBeInTheDocument()
        })
    })

    describe('Profile Widget', () => {
        it('displays user name when expanded', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Admin User')).toBeInTheDocument()
        })

        it('displays user role when expanded', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('admin')).toBeInTheDocument()
        })
    })

    describe('Logout', () => {
        it('renders Sign Out button when expanded', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            expect(screen.getByText('Sign Out')).toBeInTheDocument()
        })

        it('shows logout modal when Sign Out is clicked', () => {
            renderAdminSidebar()
            const sidebar = document.querySelector('aside')
            fireEvent.mouseEnter(sidebar)

            const signOutBtn = screen.getByText('Sign Out')
            fireEvent.click(signOutBtn)

            expect(screen.getByTestId('logout-modal')).toBeInTheDocument()
        })
    })
})
