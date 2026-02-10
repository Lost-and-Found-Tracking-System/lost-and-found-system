import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../context/AuthContext.jsx'
import api from '../../../services/api.js'

// Mock API
vi.mock('../../../services/api.js')

// Test component to consume context
const TestComponent = () => {
    const { user, login, logout, register, loading } = useAuth()
    return (
        <div>
            {loading ? 'Loading...' : user ? `Logged in as ${user.fullName}` : 'Not logged in'}
            <button onClick={() => login({ email: 'test@example.com', password: 'password' }).catch(() => { })}>Login</button>
            <button onClick={() => register({
                fullName: 'New User',
                email: 'new@example.com',
                password: 'password'
            }).catch(() => { })}>Register</button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    const renderWithProvider = (ui) => {
        return render(<AuthProvider>{ui}</AuthProvider>)
    }

    describe('Initial State', () => {

        it('starts with loading true', async () => {
            // Setup so it tries to fetch and stays loading
            localStorage.setItem('token', 'fake-token')
            api.get.mockReturnValue(new Promise(() => { })) // Pending promise

            renderWithProvider(<TestComponent />)
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })

        it('checks for existing token on mount', async () => {
            localStorage.setItem('token', 'fake-token')
            api.get.mockResolvedValueOnce({
                data: {
                    _id: 'user-1',
                    profile: { fullName: 'Existing User' },
                    role: 'student'
                }
            })

            renderWithProvider(<TestComponent />)

            await waitFor(() => {
                expect(screen.getByText('Logged in as Existing User')).toBeInTheDocument()
            })
            expect(api.get).toHaveBeenCalledWith('/v1/users/profile')
        })

        it('handles invalid token on mount', async () => {
            localStorage.setItem('token', 'invalid-token')
            api.get.mockRejectedValueOnce(new Error('Unauthorized'))

            renderWithProvider(<TestComponent />)

            await waitFor(() => {
                expect(screen.getByText('Not logged in')).toBeInTheDocument()
            })
            expect(localStorage.getItem('token')).toBeNull()
        })
    })

    describe('Login', () => {
        it('handles successful login', async () => {
            api.post.mockResolvedValueOnce({
                data: { accessToken: 'new-token', userId: 'user-1' }
            })
            api.get.mockResolvedValueOnce({
                data: {
                    _id: 'user-1',
                    profile: { fullName: 'Test User' },
                    role: 'student'
                }
            })

            renderWithProvider(<TestComponent />)

            // Wait for initial check to finish
            await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())

            screen.getByText('Login').click()

            await waitFor(() => {
                expect(screen.getByText('Logged in as Test User')).toBeInTheDocument()
            })
            expect(localStorage.getItem('token')).toBe('new-token')
        })

        it('handles login failure', async () => {
            api.post.mockRejectedValueOnce({
                response: { data: { error: 'Invalid credentials' } }
            })

            renderWithProvider(<TestComponent />)
            await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())

            screen.getByText('Login').click()

            await waitFor(() => {
                expect(screen.getByText('Not logged in')).toBeInTheDocument()
            })
        })
    })

    describe('Logout', () => {
        it('handles logout', async () => {
            // Setup logged in state
            localStorage.setItem('token', 'fake-token')
            api.get.mockResolvedValueOnce({
                data: { _id: 'user-1', profile: { fullName: 'User' } }
            })
            api.post.mockResolvedValueOnce({}) // logout endpoint

            renderWithProvider(<TestComponent />)
            await waitFor(() => expect(screen.getByText('Logged in as User')).toBeInTheDocument())

            screen.getByText('Logout').click()

            await waitFor(() => {
                expect(screen.getByText('Not logged in')).toBeInTheDocument()
            })
            expect(localStorage.getItem('token')).toBeNull()
        })
    })
})
