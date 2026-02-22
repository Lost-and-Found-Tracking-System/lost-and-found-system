import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../../pages/Register.jsx'
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
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    WaveText: ({ text }) => <span>{text}</span>
}))

vi.mock('../../context/AuthContext.jsx')

describe('Register Component', () => {
    const mockRegister = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: null,
            loading: false,
            register: mockRegister,
            login: vi.fn(),
            logout: vi.fn()
        })
    })

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        )
    }

    describe('Step 1 - Personal Information', () => {
        it('renders personal info form fields', () => {
            renderRegister()
            expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('you@amrita.edu')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('+91 9876543210')).toBeInTheDocument()
        })

        it('renders Continue button', () => {
            renderRegister()
            expect(screen.getByText('Continue')).toBeInTheDocument()
        })

        it('shows error for empty full name', async () => {
            renderRegister()

            const continueBtn = screen.getByText('Continue')
            fireEvent.click(continueBtn)

            await waitFor(() => {
                expect(screen.getByText('Full name is required')).toBeInTheDocument()
            })
        })

        it('shows error for invalid email', async () => {
            renderRegister()

            const nameInput = screen.getByPlaceholderText('John Doe')
            const emailInput = screen.getByPlaceholderText('you@amrita.edu')
            const continueBtn = screen.getByText('Continue')

            fireEvent.change(nameInput, { target: { value: 'Test User' } })
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
            fireEvent.click(continueBtn)

            await waitFor(() => {
                expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
            })
        })

        it('advances to step 2 with valid input', async () => {
            renderRegister()

            const nameInput = screen.getByPlaceholderText('John Doe')
            const emailInput = screen.getByPlaceholderText('you@amrita.edu')
            const continueBtn = screen.getByText('Continue')

            fireEvent.change(nameInput, { target: { value: 'Test User' } })
            fireEvent.change(emailInput, { target: { value: 'test@amrita.edu' } })
            fireEvent.click(continueBtn)

            await waitFor(() => {
                expect(screen.getByPlaceholderText('8+ characters')).toBeInTheDocument()
            })
        })
    })

    describe('Step 2 - Security Setup', () => {
        const goToStep2 = async () => {
            renderRegister()

            const nameInput = screen.getByPlaceholderText('John Doe')
            const emailInput = screen.getByPlaceholderText('you@amrita.edu')

            fireEvent.change(nameInput, { target: { value: 'Test User' } })
            fireEvent.change(emailInput, { target: { value: 'test@amrita.edu' } })
            fireEvent.click(screen.getByText('Continue'))

            await waitFor(() => {
                expect(screen.getByPlaceholderText('8+ characters')).toBeInTheDocument()
            })
        }

        it('renders password fields', async () => {
            await goToStep2()
            expect(screen.getByPlaceholderText('8+ characters')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
        })

        it('shows Back button', async () => {
            await goToStep2()
            expect(screen.getByText('Back')).toBeInTheDocument()
        })

        it('shows error for short password', async () => {
            await goToStep2()

            const passwordInput = screen.getByPlaceholderText('8+ characters')
            const continueBtn = screen.getByText('Continue')

            fireEvent.change(passwordInput, { target: { value: '123' } })
            fireEvent.click(continueBtn)

            await waitFor(() => {
                expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
            })
        })

        it('shows error for mismatched passwords', async () => {
            await goToStep2()

            const passwordInput = screen.getByPlaceholderText('8+ characters')
            const confirmInput = screen.getByPlaceholderText('Repeat password')
            const continueBtn = screen.getByText('Continue')

            fireEvent.change(passwordInput, { target: { value: 'password123' } })
            fireEvent.change(confirmInput, { target: { value: 'different123' } })
            fireEvent.click(continueBtn)

            await waitFor(() => {
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
            })
        })
    })

    describe('Step 3 - Role Selection', () => {
        const goToStep3 = async () => {
            renderRegister()

            // Step 1
            fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } })
            fireEvent.change(screen.getByPlaceholderText('you@amrita.edu'), { target: { value: 'test@amrita.edu' } })
            fireEvent.click(screen.getByText('Continue'))

            await waitFor(() => screen.getByPlaceholderText('8+ characters'))

            // Step 2
            fireEvent.change(screen.getByPlaceholderText('8+ characters'), { target: { value: 'password123' } })
            fireEvent.change(screen.getByPlaceholderText('Repeat password'), { target: { value: 'password123' } })
            fireEvent.click(screen.getByText('Continue'))

            await waitFor(() => screen.getByText('Student'))
        }

        it('renders role selection options', async () => {
            await goToStep3()
            expect(screen.getByText('Student')).toBeInTheDocument()
            expect(screen.getByText('Faculty')).toBeInTheDocument()
        })

        it('renders Create Account button', async () => {
            await goToStep3()
            expect(screen.getByText('Create Account')).toBeInTheDocument()
        })

        it('calls register with correct data', async () => {
            mockRegister.mockResolvedValue({ success: true })
            await goToStep3()

            const createBtn = screen.getByText('Create Account')
            fireEvent.click(createBtn)

            await waitFor(() => {
                expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
                    fullName: 'Test User',
                    email: 'test@amrita.edu',
                    password: 'password123',
                    role: 'student'
                }))
            })
        })
    })

    describe('Navigation Links', () => {
        it('has link to login page', () => {
            renderRegister()
            const loginLink = screen.getByText(/Already have an account/i).closest('a')
            expect(loginLink).toHaveAttribute('href', '/login')
        })
    })
})
