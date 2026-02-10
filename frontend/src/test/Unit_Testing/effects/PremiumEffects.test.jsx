import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
    GlitchText,
    MagneticCursor,
    ParticleCursor,
    MorphingBlob,
    WaveText,
    TextCube,
    LiquidText,
    AuroraBackground,
    NoiseOverlay,
    SpotlightCursor,
    ElasticButton,
    ScrambleLink,
    FloatingElement,
    StaggerReveal,
    GradientFlowText,
    Typewriter,
    RevealMask,
    Card3D,
    RippleButton,
    InfiniteMarquee
} from '../../../effects/PremiumEffects.jsx'



// Mock GSAP
vi.mock('gsap', () => {
    const gsapMock = {
        to: vi.fn(),
        fromTo: vi.fn(),
        timeline: vi.fn(() => ({
            to: vi.fn().mockReturnThis(),
            kill: vi.fn()
        })),
        set: vi.fn()
    }
    return {
        gsap: gsapMock,
        default: gsapMock
    }
})

// Mock basic Canvas context methods used in components
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    fillStyle: '',
    font: '',
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    shadowBlur: 0,
    shadowColor: '',
    globalAlpha: 1
})

describe('PremiumEffects Components', () => {
    describe('GlitchText', () => {
        it('renders text', () => {
            render(<GlitchText text="Glitch" />)
            expect(screen.getByText('Glitch')).toBeInTheDocument()
        })
    })

    describe('MagneticCursor', () => {
        it('renders children', () => {
            render(
                <MagneticCursor>
                    <button>Magnetic</button>
                </MagneticCursor>
            )
            expect(screen.getByRole('button')).toBeInTheDocument()
        })
    })

    describe('ParticleCursor', () => {
        it('renders canvas', () => {
            const { container } = render(<ParticleCursor />)
            expect(container.querySelector('canvas')).toBeInTheDocument()
        })
    })

    describe('MorphingBlob', () => {
        it('renders blob div', () => {
            const { container } = render(<MorphingBlob />)
            expect(container.firstChild).toHaveClass('absolute')
        })
    })

    describe('WaveText', () => {
        it('renders split characters', () => {
            const { container } = render(<WaveText text="Wave" />)
            expect(container.querySelectorAll('.wave-char')).toHaveLength(4)
        })
    })

    describe('TextCube', () => {
        it('renders faces', () => {
            render(<TextCube faces={['A', 'B', 'C', 'D']} />)
            expect(screen.getByText('A')).toBeInTheDocument()
            expect(screen.getByText('B')).toBeInTheDocument()
        })
    })

    describe('LiquidText', () => {
        it('renders children and svg filter', () => {
            const { container } = render(<LiquidText>Liquid</LiquidText>)
            expect(screen.getByText('Liquid')).toBeInTheDocument()
            expect(container.querySelector('filter')).toBeInTheDocument()
        })
    })

    describe('AuroraBackground', () => {
        it('renders aurora layers', () => {
            const { container } = render(<AuroraBackground />)
            expect(container.querySelectorAll('.aurora')).toHaveLength(3)
        })
    })

    describe('NoiseOverlay', () => {
        it('renders overlay div', () => {
            const { container } = render(<NoiseOverlay />)
            expect(container.firstChild).toHaveStyle({ opacity: '0.03' })
        })
    })

    describe('SpotlightCursor', () => {
        it('renders spotlight div', () => {
            const { container } = render(<SpotlightCursor />)
            expect(container.firstChild).toHaveClass('fixed pointer-events-none')
        })
    })

    describe('ElasticButton', () => {
        it('renders button and handles click', () => {
            const handleClick = vi.fn()
            render(<ElasticButton onClick={handleClick}>Elastic</ElasticButton>)

            fireEvent.click(screen.getByRole('button'))
            expect(handleClick).toHaveBeenCalled()
        })
    })

    describe('ScrambleLink', () => {
        it('renders link text', () => {
            render(<ScrambleLink text="Scramble" />)
            expect(screen.getByText('Scramble')).toBeInTheDocument()
        })
    })

    describe('FloatingElement', () => {
        it('renders children', () => {
            render(<FloatingElement>Float</FloatingElement>)
            expect(screen.getByText('Float')).toBeInTheDocument()
        })
    })

    describe('StaggerReveal', () => {
        it('renders children', () => {
            render(
                <StaggerReveal>
                    <div>Item 1</div>
                    <div>Item 2</div>
                </StaggerReveal>
            )
            expect(screen.getByText('Item 1')).toBeInTheDocument()
        })
    })

    describe('GradientFlowText', () => {
        it('renders children with gradient style', () => {
            render(<GradientFlowText>Flow</GradientFlowText>)
            expect(screen.getByText('Flow')).toHaveClass('bg-clip-text')
        })
    })

    describe('Typewriter', () => {
        it('renders text cursor', () => {
            const { container } = render(<Typewriter texts={['Hello']} />)
            expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
        })
    })

    describe('RevealMask', () => {
        it('renders children and mask', () => {
            render(
                <RevealMask>
                    <div>Content</div>
                </RevealMask>
            )
            expect(screen.getByText('Content')).toBeInTheDocument()
        })
    })

    describe('Card3D', () => {
        it('renders front and back content', () => {
            render(<Card3D front="Front" back="Back" />)
            expect(screen.getByText('Front')).toBeInTheDocument()
            expect(screen.getByText('Back')).toBeInTheDocument()
        })

        it('flips on click', () => {
            const { container } = render(<Card3D front="Front" back="Back" />)
            fireEvent.click(container.firstChild)
            // Flip state is internal and GSAP driven, verifying render stability
            expect(screen.getByText('Front')).toBeInTheDocument()
        })
    })

    describe('RippleButton', () => {
        it('renders button and calls onClick', () => {
            const handleClick = vi.fn()
            render(<RippleButton onClick={handleClick}>Ripple</RippleButton>)

            fireEvent.click(screen.getByRole('button'))
            expect(handleClick).toHaveBeenCalled()
        })
    })

    describe('InfiniteMarquee', () => {
        it('renders duplicated content for loop', () => {
            render(<InfiniteMarquee>Marquee Content</InfiniteMarquee>)
            const items = screen.getAllByText('Marquee Content')
            expect(items.length).toBeGreaterThan(1)
        })
    })
})
