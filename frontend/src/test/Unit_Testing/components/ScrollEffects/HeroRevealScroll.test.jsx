import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroRevealScroll, { SmoothScrollWrapper } from '../../../../components/ScrollEffects/HeroRevealScroll.jsx'

// Mock GSAP
vi.mock('gsap', () => ({
    gsap: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        utils: { toArray: vi.fn(() => []) }
    },
    default: {
        registerPlugin: vi.fn(),
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn(),
        utils: { toArray: vi.fn(() => []) }
    }
}))

vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {}
}))

describe('HeroRevealScroll Component', () => {
    describe('Rendering', () => {
        it('renders default title', () => {
            render(<HeroRevealScroll />)
            expect(screen.getByText('DISCOVER')).toBeInTheDocument()
        })

        it('renders default subtitle', () => {
            render(<HeroRevealScroll />)
            expect(screen.getByText('THE UNKNOWN')).toBeInTheDocument()
        })

        it('renders custom title', () => {
            render(<HeroRevealScroll title="CUSTOM TITLE" />)
            expect(screen.getByText('CUSTOM TITLE')).toBeInTheDocument()
        })

        it('renders custom subtitle', () => {
            render(<HeroRevealScroll subtitle="CUSTOM SUBTITLE" />)
            expect(screen.getByText('CUSTOM SUBTITLE')).toBeInTheDocument()
        })

        it('renders children content', () => {
            render(
                <HeroRevealScroll>
                    <p>Test child content</p>
                </HeroRevealScroll>
            )
            expect(screen.getByText('Test child content')).toBeInTheDocument()
        })

        it('renders with custom className', () => {
            const { container } = render(<HeroRevealScroll className="custom-class" />)
            expect(container.querySelector('.custom-class')).toBeInTheDocument()
        })

        it('renders parallax items when provided', () => {
            const parallaxItems = [
                { content: <span>Item 1</span>, left: '10%' },
                { content: <span>Item 2</span>, left: '50%' }
            ]
            render(<HeroRevealScroll parallaxItems={parallaxItems} />)

            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })

        it('renders default floating shapes when no parallaxItems', () => {
            const { container } = render(<HeroRevealScroll />)
            expect(container.querySelectorAll('.floating-shape').length).toBe(5)
        })
    })
})

describe('SmoothScrollWrapper Component', () => {
    it('renders children', () => {
        render(
            <SmoothScrollWrapper>
                <div>Wrapper content</div>
            </SmoothScrollWrapper>
        )
        expect(screen.getByText('Wrapper content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(
            <SmoothScrollWrapper className="custom-wrapper">
                <div>Content</div>
            </SmoothScrollWrapper>
        )
        expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
    })
})
