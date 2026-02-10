import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
    DNALoader,
    GlowingOrb,
    SplitRevealText,
    MeteorShower,
    HolographicCard,
    MatrixRain,
    BreathingCircle,
    CyberpunkGrid,
    NeonText,
    PulseRings,
    FloatingIcons,
    GradientBorderCard,
    ScrollProgress,
    HoverUnderline,
    LoadingDots,
    TiltCard,
    AnimatedShapes,
    ShadowText,
    ParticleExplosion
} from '../../../effects/AdvancedEffects.jsx'



// Mock GSAP
vi.mock('gsap', () => {
    const gsapMock = {
        to: vi.fn(),
        fromTo: vi.fn(),
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
    font: ''
})

describe('AdvancedEffects Components', () => {
    describe('DNALoader', () => {
        it('renders with correct structure', () => {
            const { container } = render(<DNALoader />)
            expect(container.querySelector('.dna-helix')).toBeInTheDocument()
            expect(container.querySelectorAll('.dna-strand')).toHaveLength(10)
        })
    })

    describe('GlowingOrb', () => {
        it('renders with correct styles', () => {
            const { container } = render(<GlowingOrb color="#ff0000" size={100} />)
            const orb = container.firstChild
            expect(orb).toHaveStyle({ width: '100px', height: '100px' })
        })
    })

    describe('SplitRevealText', () => {
        it('renders text with reveal structure', () => {
            const { container } = render(<SplitRevealText text="Test Text" />)
            expect(container.querySelector('.top-half')).toHaveTextContent('Test Text')
            expect(container.querySelector('.bottom-half')).toHaveTextContent('Test Text')
        })
    })

    describe('MeteorShower', () => {
        it('renders meteors', () => {
            const { container } = render(<MeteorShower />)
            expect(container.querySelectorAll('.meteor')).toHaveLength(20)
        })
    })

    describe('HolographicCard', () => {
        it('renders children and overlay', () => {
            const { container } = render(
                <HolographicCard>
                    <div>Card Content</div>
                </HolographicCard>
            )
            expect(screen.getByText('Card Content')).toBeInTheDocument()
            expect(container.firstChild).toHaveStyle({ transformStyle: 'preserve-3d' })
        })
    })

    describe('MatrixRain', () => {
        it('renders canvas', () => {
            const { container } = render(<MatrixRain />)
            expect(container.querySelector('canvas')).toBeInTheDocument()
        })
    })

    describe('BreathingCircle', () => {
        it('renders concentric circles', () => {
            const { container } = render(<BreathingCircle />)
            expect(container.firstChild.children.length).toBeGreaterThan(1)
        })
    })


    describe('CyberpunkGrid', () => {
        it('renders grid layers', () => {
            const { container } = render(<CyberpunkGrid />)
            expect(container.firstChild.children.length).toBe(3) // 2 divs + style tag
        })
    })

    describe('NeonText', () => {
        it('renders children with neon effect', () => {
            render(<NeonText>Neon Content</NeonText>)
            expect(screen.getByText('Neon Content')).toBeInTheDocument()
        })
    })

    describe('PulseRings', () => {
        it('renders multiple rings', () => {
            const { container } = render(<PulseRings />)
            expect(container.firstChild.children.length).toBe(6) // 4 rings + center dot + style tag
        })
    })

    describe('FloatingIcons', () => {
        it('renders icons', () => {
            const MockIcon = () => <svg data-testid="mock-icon" />
            render(<FloatingIcons icons={[MockIcon, MockIcon]} />)
            expect(screen.getAllByTestId('mock-icon')).toHaveLength(2)
        })
    })

    describe('GradientBorderCard', () => {
        it('renders children inside card', () => {
            render(
                <GradientBorderCard>
                    <div>Card Content</div>
                </GradientBorderCard>
            )
            expect(screen.getByText('Card Content')).toBeInTheDocument()
        })
    })

    describe('ScrollProgress', () => {
        it('renders progress bar', () => {
            const { container } = render(<ScrollProgress />)
            expect(container.firstChild).toHaveClass('fixed')
        })
    })

    describe('HoverUnderline', () => {
        it('renders children and underline', () => {
            render(
                <HoverUnderline>
                    <span>Link Text</span>
                </HoverUnderline>
            )
            expect(screen.getByText('Link Text')).toBeInTheDocument()
        })
    })

    describe('LoadingDots', () => {
        it('renders 3 dots', () => {
            const { container } = render(<LoadingDots />)
            expect(container.firstChild.children).toHaveLength(4) // 3 dots + style tag
        })
    })

    describe('TiltCard', () => {
        it('renders children', () => {
            render(
                <TiltCard>
                    <div>Tilt Content</div>
                </TiltCard>
            )
            expect(screen.getByText('Tilt Content')).toBeInTheDocument()
        })
    })

    describe('AnimatedShapes', () => {
        it('renders shapes', () => {
            const { container } = render(<AnimatedShapes />)
            expect(container.firstChild.children.length).toBeGreaterThan(1)
        })
    })

    describe('ShadowText', () => {
        it('renders children with shadow style', () => {
            render(<ShadowText>Shadow Content</ShadowText>)
            expect(screen.getByText('Shadow Content')).toBeInTheDocument()
        })
    })

    describe('ParticleExplosion', () => {
        it('renders children', () => {
            render(
                <ParticleExplosion>
                    <button>Click Me</button>
                </ParticleExplosion>
            )
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('triggers explosion on click', () => {
            const { container } = render(
                <ParticleExplosion>
                    <button>Click Me</button>
                </ParticleExplosion>
            )
            fireEvent.click(screen.getByRole('button'))
            // Logic validation relies on visual/GSAP, so we just ensure no crash
            expect(container.firstChild).toBeInTheDocument()
        })
    })
})
