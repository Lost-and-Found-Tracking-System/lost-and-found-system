import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ReportItem from '../../pages/ReportItem';
import api from '../../services/api';

// Mock API
vi.mock('../../services/api');
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));
vi.mock('../../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock Effects (all exports used by ReportItem.jsx)
vi.mock('../../effects', () => ({
    MorphingBlob: () => <div />,
    AuroraBackground: () => <div />,
    NoiseOverlay: () => <div />,
    ElasticButton: ({ children, onClick, ...props }) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
    GlitchText: ({ text }) => <span>{text}</span>,
    NeonText: ({ children }) => <span>{children}</span>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    TiltCard: ({ children }) => <div>{children}</div>,
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    PulseRings: () => <div />,
    WaveText: ({ text }) => <span>{text}</span>,
    GradientFlowText: ({ children }) => <span>{children}</span>,
    HolographicCard: ({ children }) => <div>{children}</div>
}));

// Mock GSAP Animations Hook
vi.mock('../../hooks/useGSAPAnimations', () => ({
    useGSAPAnimations: () => ({}),
    usePageTransition: () => ({}),
    useScrollReveal: () => ({}),
    useMagneticHover: () => ({}),
    use3DTilt: () => ({}),
    useStaggerAnimation: () => ({}),
    useCounter: () => ({}),
    useElasticPress: () => ({}),
    useModalAnimation: () => ({ animateIn: vi.fn(), animateOut: vi.fn() }),
    useHorizontalScroll: () => ({}),
    useParallax: () => ({}),
    useSpotlightCursor: () => ({}),
    useTextReveal: () => ({}),
    useCardLift: () => ({}),
    useSplitText: () => ({}),
    useMorphingBlob: () => ({})
}));

// Mock URL.createObjectURL for file upload preview
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

describe('Integration: Report Item Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Mock authenticated user
        localStorage.setItem('token', 'valid-token');
        localStorage.setItem('user', JSON.stringify({ id: '123', role: 'student' }));
    });

    it('User can fill and submit a lost item report', async () => {
        // Mock API calls
        api.get.mockImplementation((url) => {
            if (url.includes('/users/profile')) {
                return Promise.resolve({
                    data: {
                        _id: '123',
                        role: 'student',
                        profile: { email: 'test@test.com', fullName: 'Test User' }
                    }
                });
            }
            if (url.includes('/zones')) {
                return Promise.resolve({
                    data: { zones: [{ _id: 'z1', zoneName: 'Library' }] }
                });
            }
            return Promise.resolve({ data: {} });
        });

        api.post.mockResolvedValue({ data: { success: true, item: { id: 1 } } });

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/report']}>
                    <Routes>
                        <Route path="/report" element={<ReportItem />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        // Step 1: Type Selection — "What type of item?"
        await waitFor(() => {
            expect(screen.getByText('What type of item?')).toBeInTheDocument();
        });

        // Click "Lost Item"
        fireEvent.click(screen.getByText('Lost Item'));

        // Click Continue
        fireEvent.click(screen.getByText('Continue'));

        // Step 2: Details — "Item Details"
        await waitFor(() => {
            expect(screen.getByText('Item Details')).toBeInTheDocument();
        });

        // Fill Title (uses placeholder)
        fireEvent.change(screen.getByPlaceholderText('e.g., Blue iPhone 15 Pro'), {
            target: { value: 'Blue Backpack' }
        });

        // Select Category
        fireEvent.click(screen.getByText('Electronics'));

        // Fill Description (uses placeholder)
        fireEvent.change(screen.getByPlaceholderText(/describe the item/i), {
            target: { value: 'Nike backpack with laptop inside' }
        });

        // Click Continue
        fireEvent.click(screen.getByText('Continue'));

        // Step 3: Location — "Where & When?"
        await waitFor(() => {
            expect(screen.getByText('Where & When?')).toBeInTheDocument();
        });

        // Select Zone (it's a <select> element)
        const zoneSelect = screen.getByRole('combobox');
        fireEvent.change(zoneSelect, { target: { value: 'Library' } });

        // Set Date via querySelector since type="date" doesn't have a role
        const dateEl = document.querySelector('input[type="date"]');
        fireEvent.change(dateEl, { target: { value: '2026-02-01' } });

        // Click Continue to Step 4
        fireEvent.click(screen.getByText('Continue'));

        // Step 4: Images — "Add Photos"
        await waitFor(() => {
            expect(screen.getByText('Add Photos')).toBeInTheDocument();
        });

        // Click Submit Report
        fireEvent.click(screen.getByText('Submit Report'));

        // Verify API Call
        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
    });
});
