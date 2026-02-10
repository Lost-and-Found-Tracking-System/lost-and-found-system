import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AIConfig from '../../../pages/admin/AIConfig.jsx'
import api from '../../../services/api.js'

// Mock modules
vi.mock('../../../services/api.js')
vi.mock('../../../components/AdminSidebar.jsx', () => ({
    default: () => <div data-testid="admin-sidebar">AdminSidebar</div>
}))
vi.mock('../../../hooks/useGSAPAnimations', () => ({
    usePageTransition: vi.fn()
}))

describe('AIConfig Component', () => {
    const mockConfig = {
        thresholds: { autoApprove: 90, partialMatch: 70 },
        weights: { text: 70, image: 85, location: 90, time: 50 }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: mockConfig })
        api.put.mockResolvedValue({ data: { success: true } })
    })

    const renderAIConfig = () => {
        return render(
            <BrowserRouter>
                <AIConfig />
            </BrowserRouter>
        )
    }

    describe('Rendering', () => {
        it('renders admin sidebar', async () => {
            renderAIConfig()
            expect(await screen.findByTestId('admin-sidebar')).toBeInTheDocument()
        })

        it('renders AI Engine Config header', async () => {
            renderAIConfig()
            expect(await screen.findByText('AI Engine Config')).toBeInTheDocument()
        })

        it('renders Back to Dashboard link', async () => {
            renderAIConfig()
            expect(await screen.findByText(/Back to Dashboard/i)).toBeInTheDocument()
        })

        it('renders Engine Active badge', async () => {
            renderAIConfig()
            expect(await screen.findByText('Engine Active')).toBeInTheDocument()
        })
    })

    describe('Confidence Thresholds Panel', () => {
        it('renders Confidence Thresholds header', async () => {
            renderAIConfig()
            expect(await screen.findByText('Confidence Thresholds')).toBeInTheDocument()
        })

        it('renders Auto-Approve threshold', async () => {
            renderAIConfig()
            expect(await screen.findByText('Auto-Approve')).toBeInTheDocument()
        })

        it('renders Partial Match threshold', async () => {
            renderAIConfig()
            expect(await screen.findByText('Partial Match (Review)')).toBeInTheDocument()
        })

        it('fetches config on mount', async () => {
            renderAIConfig()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/admin/ai-config')
            })
        })
    })

    describe('Feature Weights Panel', () => {
        it('renders Feature Weights header', async () => {
            renderAIConfig()
            expect(await screen.findByText('Feature Weights')).toBeInTheDocument()
        })

        it('renders all weight labels', async () => {
            renderAIConfig()

            expect(await screen.findByText('Description Text')).toBeInTheDocument()
            expect(await screen.findByText('Visual Similarity')).toBeInTheDocument()
            expect(await screen.findByText('Geolocation')).toBeInTheDocument()
            expect(await screen.findByText('Time Window')).toBeInTheDocument()
        })
    })

    describe('Save Functionality', () => {
        it('renders Apply Configuration button', async () => {
            renderAIConfig()
            expect(await screen.findByText('Apply Configuration')).toBeInTheDocument()
        })

        it('calls API when Apply Configuration is clicked', async () => {
            renderAIConfig()

            const saveBtn = await screen.findByText('Apply Configuration')
            fireEvent.click(saveBtn)

            await waitFor(() => {
                expect(api.put).toHaveBeenCalledWith('/v1/admin/ai-config', expect.any(Object))
            })
        })

        it('shows success message after save', async () => {
            renderAIConfig()

            const saveBtn = await screen.findByText('Apply Configuration')
            fireEvent.click(saveBtn)

            expect(await screen.findByText('Configuration saved successfully!')).toBeInTheDocument()
        })

        it('shows error message on save failure', async () => {
            api.put.mockRejectedValue(new Error('Save failed'))
            renderAIConfig()

            const saveBtn = await screen.findByText('Apply Configuration')
            fireEvent.click(saveBtn)

            expect(await screen.findByText('Failed to save configuration')).toBeInTheDocument()
        })
    })

    describe('Footer', () => {
        it('renders auto-save inactive message', async () => {
            renderAIConfig()
            expect(await screen.findByText('Auto-save inactive.')).toBeInTheDocument()
        })
    })
})
