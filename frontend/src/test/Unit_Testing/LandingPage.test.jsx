import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from '../../pages/LandingPage.jsx'

// Mock GSAP
vi.mock('gsap', () => ({
    gsap: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        utils: { toArray: vi.fn(() => []) },
        getById: vi.fn()
    },
    default: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        utils: { toArray: vi.fn(() => []) },
        getById: vi.fn()
    }
}))

vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {}
}))

// Mock Premium Effects
vi.mock('../../effects/PremiumEffects', () => ({
    GlitchText: ({ text }) => <span data-testid="glitch-text">{text}</span>,
    ParticleCursor: () => null,
    MorphingBlob: () => null,
    WaveText: ({ text }) => <span>{text}</span>,
    AuroraBackground: () => null,
    NoiseOverlay: () => null,
    SpotlightCursor: () => null,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    ScrambleLink: ({ text, href }) => <a href={href}>{text}</a>,
    FloatingElement: ({ children }) => <div>{children}</div>,
    GradientFlowText: ({ children }) => <span>{children}</span>,
    Typewriter: ({ texts }) => <span>{texts[0]}</span>,
    InfiniteMarquee: ({ children }) => <div data-testid="marquee">{children}</div>,
    RippleButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    )
}))

// Mock Advanced Effects
vi.mock('../../effects/AdvancedEffects', () => ({
    MeteorShower: () => null,
    HolographicCard: ({ children, className }) => <div className={className}>{children}</div>,
    CyberpunkGrid: () => null,
    NeonText: ({ children }) => <span data-testid="neon-text">{children}</span>,
    PulseRings: () => null,
    GradientBorderCard: ({ children, className }) => <div className={className}>{children}</div>,
    ScrollProgress: () => null,
    TiltCard: ({ children, className }) => <div className={className}>{children}</div>,
    AnimatedShapes: () => null,
    ParticleExplosion: ({ children }) => <div>{children}</div>,
    GlowingOrb: () => null,
    BreathingCircle: () => null
}))

describe('LandingPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderLandingPage = () => {
        return render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        )
    }

    describe('Hero Section', () => {
        it('renders the main LOST & FOUND title', () => {
            renderLandingPage()

            // Check for letters - use getAllByText since letters appear multiple times
            const allLetters = screen.getAllByText(/^[LOSTFUND]$/)
            expect(allLetters.length).toBeGreaterThan(0)
            // & is rendered in NeonText
            const ampersandElements = screen.getAllByTestId('neon-text')
            expect(ampersandElements.length).toBeGreaterThan(0)
        })

        it('renders the Get Started button', () => {
            renderLandingPage()

            expect(screen.getByText('Get Started')).toBeInTheDocument()
        })

        it('renders the Browse Items button', () => {
            renderLandingPage()

            const browseButtons = screen.getAllByText(/Browse Items/i)
            expect(browseButtons.length).toBeGreaterThan(0)
        })

        it('renders the campus badge', () => {
            renderLandingPage()

            // GlitchText shows "AMRITA CAMPUS • LIVE"
            expect(screen.getByTestId('glitch-text')).toBeInTheDocument()
        })

        it('renders the scroll indicator', () => {
            renderLandingPage()

            expect(screen.getByText('Scroll')).toBeInTheDocument()
        })
    })

    describe('Marquee Section', () => {
        it('renders the item categories marquee', () => {
            renderLandingPage()

            expect(screen.getByTestId('marquee')).toBeInTheDocument()
            expect(screen.getByText('ELECTRONICS')).toBeInTheDocument()
            expect(screen.getByText('PHONES')).toBeInTheDocument()
        })
    })

    describe('Features Section', () => {
        it('renders FEATURES header', () => {
            renderLandingPage()

            expect(screen.getByText('FEATURES')).toBeInTheDocument()
        })

        it('renders feature cards', () => {
            renderLandingPage()

            expect(screen.getByText('AI Matching')).toBeInTheDocument()
            expect(screen.getByText('Zone Tracking')).toBeInTheDocument()
            expect(screen.getByText('Verified Claims')).toBeInTheDocument()
            expect(screen.getByText('Instant Alerts')).toBeInTheDocument()
        })
    })

    describe('CTA Section', () => {
        it('renders the CTA heading', () => {
            renderLandingPage()

            expect(screen.getByText(/Ready to/)).toBeInTheDocument()
        })

        it('renders Create Account button', () => {
            renderLandingPage()

            expect(screen.getByText('Create Account')).toBeInTheDocument()
        })

        it('renders Visitor Access button', () => {
            renderLandingPage()

            expect(screen.getByText('Visitor Access')).toBeInTheDocument()
        })
    })

    describe('Footer Section', () => {
        it('renders the L&F logo', () => {
            renderLandingPage()

            // Footer has L&F text
            const footerText = screen.getAllByText('L')
            expect(footerText.length).toBeGreaterThan(0)
        })

        it('renders Platform links', () => {
            renderLandingPage()

            expect(screen.getByText('Platform')).toBeInTheDocument()
            expect(screen.getByText('Sign In')).toBeInTheDocument()
            expect(screen.getByText('Register')).toBeInTheDocument()
        })

        it('renders Support links', () => {
            renderLandingPage()

            expect(screen.getByText('Support')).toBeInTheDocument()
            expect(screen.getByText('Contact Admin')).toBeInTheDocument()
            expect(screen.getByText('Privacy')).toBeInTheDocument()
        })

        it('renders copyright notice', () => {
            renderLandingPage()

            expect(screen.getByText('© 2026 Amrita Lost & Found System')).toBeInTheDocument()
        })
    })

    describe('How It Works Section', () => {
        it('renders the step titles', () => {
            renderLandingPage()

            expect(screen.getByText('REPORT')).toBeInTheDocument()
            expect(screen.getByText('MATCH')).toBeInTheDocument()
            expect(screen.getByText('VERIFY')).toBeInTheDocument()
            expect(screen.getByText('REUNITE')).toBeInTheDocument()
        })
    })
})
