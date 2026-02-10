import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import VisitorRegister from '../../pages/VisitorRegister.jsx'
import * as AuthContext from '../../context/AuthContext.jsx'
import api from '../../services/api.js'

// Mock modules
vi.mock('../../services/api.js')
vi.mock('../../context/AuthContext.jsx')
vi.mock('../../hooks/useGSAPAnimations', () => ({
    use3DTilt: vi.fn(),
    useMagneticHover: vi.fn()
}))

describe('VisitorRegister Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            login: vi.fn(),
            user: null,
            loading: false
        })

        api.post.mockResolvedValue({
            data: {
                accessToken: 'test-token',
                userId: 'visitor-123456',
                expiresAt: '2024-01-16T10:00:00Z',
                expiresIn: 300
            }
        })
    })

    const renderVisitorRegister = () => {
        return render(
            <BrowserRouter>
                <VisitorRegister />
            </BrowserRouter>
        )
    }

    describe('Initial Rendering (Step 1)', () => {
        it('renders VISITOR ACCESS header', () => {
            renderVisitorRegister()

            expect(screen.getByText('VISITOR')).toBeInTheDocument()
            expect(screen.getByText('ACCESS')).toBeInTheDocument()
        })

        it('renders Secure Temporary Registration subtitle', () => {
            renderVisitorRegister()

            expect(screen.getByText('Secure Temporary Registration')).toBeInTheDocument()
        })

        it('renders mobile number input', () => {
            renderVisitorRegister()

            expect(screen.getByPlaceholderText(/\+91 9876543210/i)).toBeInTheDocument()
        })

        it('renders Mobile Number label', () => {
            renderVisitorRegister()

            expect(screen.getByText('Mobile Number')).toBeInTheDocument()
        })

        it('renders Send Secure OTP button', () => {
            renderVisitorRegister()

            expect(screen.getByText('Send Secure OTP')).toBeInTheDocument()
        })

        it('renders progress indicators', () => {
            renderVisitorRegister()

            // 3 progress indicators for 3 steps
            const container = document.querySelector('.flex.items-center.justify-center.gap-3')
            expect(container).toBeInTheDocument()
        })
    })

    describe('Footer Links', () => {
        it('renders Sign In link', () => {
            renderVisitorRegister()

            expect(screen.getByText(/Already have an account\? Sign In/i)).toBeInTheDocument()
        })

        it('renders Home link', () => {
            renderVisitorRegister()

            expect(screen.getByText('Home')).toBeInTheDocument()
        })

        it('renders Student Registration link', () => {
            renderVisitorRegister()

            expect(screen.getByText('Student Registration')).toBeInTheDocument()
        })
    })

    describe('Form Interaction', () => {
        it('updates phone input on change', () => {
            renderVisitorRegister()

            const phoneInput = screen.getByPlaceholderText(/\+91 9876543210/i)
            fireEvent.change(phoneInput, { target: { value: '9876543210' } })

            expect(phoneInput.value).toBe('9876543210')
        })

        it('calls API when form is submitted', async () => {
            renderVisitorRegister()

            const phoneInput = screen.getByPlaceholderText(/\+91 9876543210/i)
            fireEvent.change(phoneInput, { target: { value: '9876543210' } })

            const submitBtn = screen.getByText('Send Secure OTP')
            fireEvent.click(submitBtn)

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/v1/auth/visitor/request-otp', expect.any(Object))
            })
        })
    })

    describe('Error Handling', () => {
        it('displays error message on API failure', async () => {
            api.post.mockRejectedValue({
                response: { data: { error: 'Phone number invalid' } }
            })

            renderVisitorRegister()

            const phoneInput = screen.getByPlaceholderText(/\+91 9876543210/i)
            fireEvent.change(phoneInput, { target: { value: '123' } })

            const submitBtn = screen.getByText('Send Secure OTP')
            fireEvent.click(submitBtn)

            expect(await screen.findByText('Phone number invalid')).toBeInTheDocument()
        })
    })
})
