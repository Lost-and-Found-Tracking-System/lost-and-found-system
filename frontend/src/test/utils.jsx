import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock AuthContext
export const mockAuthContext = {
    user: {
        _id: 'test-user-id',
        profile: {
            fullName: 'Test User',
            email: 'test@example.com'
        },
        role: 'student'
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
}

// Custom render with providers
export const renderWithProviders = (ui, options = {}) => {
    const mockUseAuth = vi.fn(() => mockAuthContext)

    vi.mock('../context/AuthContext', () => ({
        useAuth: mockUseAuth
    }))

    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>,
        options
    )
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
