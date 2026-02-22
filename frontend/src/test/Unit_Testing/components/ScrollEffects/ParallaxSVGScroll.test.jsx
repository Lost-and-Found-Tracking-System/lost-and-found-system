import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParallaxSVGScroll from '../../../../components/ScrollEffects/ParallaxSVGScroll.jsx'

// Mock GSAP
vi.mock('gsap', () => ({
    gsap: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        set: vi.fn(),
        timeline: vi.fn(() => ({
            to: vi.fn(),
            fromTo: vi.fn()
        })),
        utils: { toArray: vi.fn(() => []) }
    },
    default: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        set: vi.fn(),
        timeline: vi.fn(() => ({
            to: vi.fn(),
            fromTo: vi.fn()
        })),
        utils: { toArray: vi.fn(() => []) }
    }
}))

vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {
        create: vi.fn()
    }
}))

describe('ParallaxSVGScroll Component', () => {
    describe('Rendering', () => {
        it('renders SVG scene', () => {
            const { container } = render(<ParallaxSVGScroll />)
            expect(container.querySelector('svg')).toBeInTheDocument()
            expect(container.querySelector('#bg')).toBeInTheDocument()
            expect(container.querySelector('#clouds')).toBeInTheDocument()
            expect(container.querySelector('#scene1')).toBeInTheDocument()
            expect(container.querySelector('#scene2')).toBeInTheDocument()
            expect(container.querySelector('#scene3')).toBeInTheDocument()
        })

        it('renders children', () => {
            render(
                <ParallaxSVGScroll>
                    <div>Test Content</div>
                </ParallaxSVGScroll>
            )
            expect(screen.getByText('Test Content')).toBeInTheDocument()
        })

        it('applies height style', () => {
            const { container } = render(<ParallaxSVGScroll height={5000} />)
            const scrollElement = container.querySelector('.scroll-element')
            expect(scrollElement).toHaveStyle({ height: '5000px' })
        })

        it('defaults height to 6000px', () => {
            const { container } = render(<ParallaxSVGScroll />)
            const scrollElement = container.querySelector('.scroll-element')
            expect(scrollElement).toHaveStyle({ height: '6000px' })
        })
    })
})
