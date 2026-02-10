import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../pages/Login.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'

// Mock all effects
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    AuroraBackground: () => null,
    NoiseOverlay: () => null,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    GlitchText: ({ text }) => <span>{text}</span>,
    NeonText: ({ children }) => <span>{children}</span>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    TiltCard: ({ children }) => <div>{children}</div>,
    ParticleExplosion: ({ children }) => <div>{children}</div>
}))

vi.mock('../../context/AuthContext.jsx')

describe('Login Component', () => {
    const mockLogin = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: null,
            loading: false,
            login: mockLogin,
            logout: vi.fn()
        })
    })

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders login form with email and password inputs', () => {
            renderLogin()
            // Actual placeholder is "you@amrita.edu"
            expect(screen.getByPlaceholderText('you@amrita.edu')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
        })

        it('renders Sign In button', () => {
            renderLogin()
            expect(screen.getByText('Sign In')).toBeInTheDocument()
        })

        it('renders link to register page', () => {
            renderLogin()
            expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument()
            expect(screen.getByText('Register')).toBeInTheDocument()
        })

        it('renders Welcome Back heading', () => {
            renderLogin()
            expect(screen.getByText('Welcome Back')).toBeInTheDocument()
        })
    })

    describe('Form Submission', () => {
        it('calls login function with correct credentials', async () => {
            mockLogin.mockResolvedValue({ role: 'student' })
            renderLogin()

            const emailInput = screen.getByPlaceholderText('you@amrita.edu')
            const passwordInput = screen.getByPlaceholderText('••••••••')

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })

            // Submit the form
            const form = emailInput.closest('form')
            fireEvent.submit(form)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123'
                })
            })
        })

        it('displays error message on login failure', async () => {
            mockLogin.mockRejectedValue({ message: 'Invalid email or password' })
            renderLogin()

            const emailInput = screen.getByPlaceholderText('you@amrita.edu')
            const passwordInput = screen.getByPlaceholderText('••••••••')

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

            const form = emailInput.closest('form')
            fireEvent.submit(form)

            await waitFor(() => {
                expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
            })
        })

        it('shows loading state while authenticating', async () => {
            mockLogin.mockImplementation(() => new Promise(() => { })) // Never resolves
            renderLogin()

            const emailInput = screen.getByPlaceholderText('you@amrita.edu')
            const passwordInput = screen.getByPlaceholderText('••••••••')

            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'password123' } })

            const form = emailInput.closest('form')
            fireEvent.submit(form)

            await waitFor(() => {
                expect(screen.getByText('Authenticating...')).toBeInTheDocument()
            })
        })
    })

    describe('Password Visibility Toggle', () => {
        it('toggles password visibility when eye icon is clicked', () => {
            renderLogin()

            const passwordInput = screen.getByPlaceholderText('••••••••')
            expect(passwordInput).toHaveAttribute('type', 'password')

            // Find the toggle button (it's in the password field area)
            const toggleButton = passwordInput.parentElement.querySelector('button')
            fireEvent.click(toggleButton)

            expect(passwordInput).toHaveAttribute('type', 'text')
        })
    })

    describe('Navigation Links', () => {
        it('has link to register page', () => {
            renderLogin()
            const registerLink = screen.getByRole('link', { name: /Register/i })
            expect(registerLink).toHaveAttribute('href', '/register')
        })

        it('has link to visitor registration', () => {
            renderLogin()
            const visitorLink = screen.getByText(/Visitor/i).closest('a')
            expect(visitorLink).toHaveAttribute('href', '/register-visitor')
        })

        it('has link to home page', () => {
            renderLogin()
            const homeLink = screen.getByText(/Back to Home/i).closest('a')
            expect(homeLink).toHaveAttribute('href', '/')
        })
    })
})
