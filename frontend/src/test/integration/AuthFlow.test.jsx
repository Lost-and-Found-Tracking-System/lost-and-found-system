import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import api from '../../services/api';

// Mock API
vi.mock('../../services/api');

// Mock Layout & Sidebar
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));
vi.mock('../../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock GSAP - execute onComplete callbacks immediately
vi.mock('gsap', () => ({
    gsap: {
        to: vi.fn((target, config) => {
            if (config && config.onComplete) config.onComplete();
        }),
        fromTo: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        registerPlugin: vi.fn()
    }
}));

// Mock Effects
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

describe('Integration: Auth Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Complete Login Flow: Input -> Submit -> Token Store -> Redirect', async () => {
        // Mock all API calls: login, profile fetch (initial + after login)
        api.post.mockResolvedValue({
            data: {
                accessToken: 'fake-jwt-token',
                userId: '123',
                role: 'student'
            }
        });

        api.get.mockResolvedValue({
            data: {
                _id: '123',
                role: 'student',
                profile: {
                    email: 'test@example.com',
                    fullName: 'Test User'
                }
            }
        });

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        // 1. Check initial state
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        // 2. User fills form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        // 3. User submits
        const submitBtn = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitBtn);

        // 4. Verify API call (AuthContext uses /v1/auth/login)
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            });
        });

        // 5. Verify Token Storage
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        });

        // 6. Verify Redirect (Login form disappears, dashboard appears)
        await waitFor(() => {
            expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
        });
    });
});
