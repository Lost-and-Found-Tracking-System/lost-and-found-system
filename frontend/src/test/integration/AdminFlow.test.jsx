import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AdminDashboard from '../../pages/admin/Dashboard';
import api from '../../services/api';

// Mock API
vi.mock('../../services/api');

// Mock Layout & AdminSidebar
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));
vi.mock('../../components/AdminSidebar', () => ({
    default: () => <div data-testid="admin-sidebar">Admin Sidebar</div>
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

describe('Integration: Admin Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'admin-token');
        localStorage.setItem('user', JSON.stringify({ id: '999', role: 'admin' }));
    });

    it('Admin Dashboard loads and fetches stats', async () => {
        // Mock all API calls
        api.get.mockImplementation((url) => {
            if (url.includes('/users/profile')) {
                return Promise.resolve({
                    data: {
                        _id: '999',
                        role: 'admin',
                        profile: { email: 'admin@test.com', fullName: 'Admin' }
                    }
                });
            }
            if (url.includes('/admin/stats')) {
                return Promise.resolve({
                    data: {
                        totalUsers: 200,
                        totalItems: 150,
                        pendingClaims: 5,
                        resolvedItems: 145
                    }
                });
            }
            if (url.includes('/admin/activity')) {
                return Promise.resolve({ data: { activities: [] } });
            }
            return Promise.resolve({ data: {} });
        });

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/admin/dashboard']}>
                    <Routes>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );

        // 1. Wait for loading to finish, then verify Sidebar present
        const sidebar = await screen.findByTestId('admin-sidebar');
        expect(sidebar).toBeInTheDocument();

        // 2. Verify Stats Rendering
        await waitFor(() => {
            expect(screen.getByText('150')).toBeInTheDocument();
        });

        // 3. Verify API Calls
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/admin/stats'));
    });
});
