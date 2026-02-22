import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
    ScanlineOverlay,
    VignetteOverlay,
    NoiseOverlay,
    Perspective3DContainer,
    ParallaxLayer,
    SplitTextReveal,
    HeroReveal,
    Floating3DCard,
    ScrollGradientBackground,
    ChromaticAberration,
    ScrollProgressBar,
    StaggeredReveal
} from '../../../../components/ScrollEffects/PremiumScrollEffects.jsx'

// Mock GSAP
vi.mock('gsap', () => ({
    default: {
        registerPlugin: vi.fn(),
        to: vi.fn(),
        set: vi.fn(),
        fromTo: vi.fn(),
        killTweensOf: vi.fn()
    }
}))

vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {
        create: vi.fn(),
        getAll: vi.fn(() => [])
    }
}))

describe('PremiumScrollEffects Components', () => {
    describe('Overlays', () => {
        it('renders ScanlineOverlay', () => {
            const { container } = render(<ScanlineOverlay />)
            expect(container.querySelector('.scanline-overlay')).toBeInTheDocument()
        })

        it('renders VignetteOverlay', () => {
            const { container } = render(<VignetteOverlay />)
            expect(container.querySelector('.vignette-overlay')).toBeInTheDocument()
        })

        it('renders NoiseOverlay', () => {
            const { container } = render(<NoiseOverlay />)
            expect(container.querySelector('.noise-overlay')).toBeInTheDocument()
        })

        it('renders ChromaticAberration', () => {
            // Need to mock useScrollVelocity for this one
            // skipping strictly testing the render here as it depends on hook state
            // but we can test if it returns null when velocity is 0
            const { container } = render(<ChromaticAberration />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('Perspective3DContainer', () => {
        it('renders children with 3D styles', () => {
            const { container } = render(
                <Perspective3DContainer>
                    <div>3D Content</div>
                </Perspective3DContainer>
            )
            expect(screen.getByText('3D Content')).toBeInTheDocument()
            expect(container.firstChild).toHaveStyle({ transformStyle: 'preserve-3d' })
        })
    })

    describe('ParallaxLayer', () => {
        it('renders children', () => {
            render(
                <ParallaxLayer>
                    <div>Parallax Content</div>
                </ParallaxLayer>
            )
            expect(screen.getByText('Parallax Content')).toBeInTheDocument()
        })
    })

    describe('SplitTextReveal', () => {
        it('splits text into characters', () => {
            const { container } = render(<SplitTextReveal text="ABC" />)
            expect(container.querySelectorAll('.split-char')).toHaveLength(3)
        })
    })

    describe('HeroReveal', () => {
        it('renders split text and content', () => {
            render(
                <HeroReveal splitText="HERO">
                    <div>Hero Content</div>
                </HeroReveal>
            )
            expect(screen.getByText('H')).toBeInTheDocument()
            expect(screen.getByText('Hero Content')).toBeInTheDocument()
        })
    })

    describe('Floating3DCard', () => {
        it('renders children', () => {
            render(
                <Floating3DCard>
                    <div>Card Content</div>
                </Floating3DCard>
            )
            expect(screen.getByText('Card Content')).toBeInTheDocument()
        })
    })

    describe('ScrollGradientBackground', () => {
        it('renders gradient background div', () => {
            const { container } = render(<ScrollGradientBackground />)
            expect(container.querySelector('.scroll-gradient-bg')).toBeInTheDocument()
        })
    })

    describe('ScrollProgressBar', () => {
        it('renders progress bar', () => {
            const { container } = render(<ScrollProgressBar />)
            expect(container.querySelector('.scroll-progress-bar')).toBeInTheDocument()
        })
    })

    describe('StaggeredReveal', () => {
        it('renders children in container', () => {
            render(
                <StaggeredReveal>
                    <div>Item 1</div>
                    <div>Item 2</div>
                </StaggeredReveal>
            )
            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })
    })
})
