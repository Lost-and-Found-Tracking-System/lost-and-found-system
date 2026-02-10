import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, AppRoutes } from '../../App'
import { AuthProvider, useAuth } from '../../context/AuthContext'

// Mock AuthContext
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext')
    return {
        ...actual,
        useAuth: vi.fn(),
        AuthProvider: ({ children }) => <div>{children}</div>
    }
})

// Mock Pages
vi.mock('../../pages/LandingPage', () => ({ default: () => <div>Landing Page</div> }))
vi.mock('../../pages/Login', () => ({ default: () => <div>Login Page</div> }))
vi.mock('../../pages/Register', () => ({ default: () => <div>Register Page</div> }))
vi.mock('../../pages/VisitorRegister', () => ({ default: () => <div>Visitor Register Page</div> }))
vi.mock('../../pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('../../pages/ReportItem', () => ({ default: () => <div>Report Item Page</div> }))
vi.mock('../../pages/ItemInventory', () => ({ default: () => <div>Item Inventory Page</div> }))
vi.mock('../../pages/ItemDetails', () => ({ default: () => <div>Item Details Page</div> }))
vi.mock('../../pages/SubmitClaim', () => ({ default: () => <div>Submit Claim Page</div> }))
vi.mock('../../pages/MyClaims', () => ({ default: () => <div>My Claims Page</div> }))
vi.mock('../../pages/Notifications', () => ({ default: () => <div>Notifications Page</div> }))
vi.mock('../../pages/Profile', () => ({ default: () => <div>Profile Page</div> }))

// Admin Pages
vi.mock('../../pages/admin/Dashboard', () => ({ default: () => <div>Admin Dashboard</div> }))
vi.mock('../../pages/admin/RoleManagement', () => ({ default: () => <div>Role Management</div> }))
vi.mock('../../pages/admin/ZoneManagement', () => ({ default: () => <div>Zone Management</div> }))
vi.mock('../../pages/admin/Claims', () => ({ default: () => <div>Claims Management</div> }))
vi.mock('../../pages/admin/AIConfig', () => ({ default: () => <div>AI Config</div> }))

describe('App Routing Components', () => {

    describe('ProtectedRoute', () => {
        it('shows loading spinner when loading', () => {
            useAuth.mockReturnValue({ user: null, loading: true })
            const { container } = render(
                <MemoryRouter>
                    <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
                </MemoryRouter>
            )
            expect(container.querySelector('.animate-spin')).toBeInTheDocument()
        })

        it('redirects to login if no user', () => {
            useAuth.mockReturnValue({ user: null, loading: false })
            render(
                <MemoryRouter initialEntries={['/protected']}>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route path="/protected" element={
                            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            )
            expect(screen.getByText('Login Page')).toBeInTheDocument()
        })

        it('renders children if user is authenticated', () => {
            useAuth.mockReturnValue({ user: { role: 'student' }, loading: false })
            render(
                <MemoryRouter>
                    <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
                </MemoryRouter>
            )
            expect(screen.getByText('Protected Content')).toBeInTheDocument()
        })

        it('redirects to dashboard if user lacks required role', () => {
            useAuth.mockReturnValue({ user: { role: 'student' }, loading: false })
            render(
                <MemoryRouter initialEntries={['/admin']}>
                    <Routes>
                        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            )
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        })
    })

    describe('PublicRoute', () => {
        it('redirects to dashboard if user is logged in', () => {
            useAuth.mockReturnValue({ user: { role: 'student' }, loading: false })
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                        <Route path="/login" element={
                            <PublicRoute><div>Login Content</div></PublicRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            )
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        })

        it('redirects info admin to admin dashboard if logged in', () => {
            useAuth.mockReturnValue({ user: { role: 'admin' }, loading: false })
            render(
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/admin" element={<div>Admin Dashboard</div>} />
                        <Route path="/login" element={
                            <PublicRoute><div>Login Content</div></PublicRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            )
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
        })

        it('renders children if not logged in', () => {
            useAuth.mockReturnValue({ user: null, loading: false })
            render(
                <MemoryRouter>
                    <PublicRoute><div>Login Content</div></PublicRoute>
                </MemoryRouter>
            )
            expect(screen.getByText('Login Content')).toBeInTheDocument()
        })
    })

    describe('AppRoutes', () => {
        it('renders Landing Page on root', () => {
            useAuth.mockReturnValue({ user: null, loading: false })
            render(
                <MemoryRouter initialEntries={['/']}>
                    <AppRoutes />
                </MemoryRouter>
            )
            expect(screen.getByText('Landing Page')).toBeInTheDocument()
        })

        it('navigates to Dashboard on /dashboard', () => {
            useAuth.mockReturnValue({ user: { role: 'student' }, loading: false })
            render(
                <MemoryRouter initialEntries={['/dashboard']}>
                    <AppRoutes />
                </MemoryRouter>
            )
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        })
    })
})
