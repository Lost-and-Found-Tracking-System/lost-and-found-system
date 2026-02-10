import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HyperScroll3D, { HyperCard } from '../../../../components/ScrollEffects/HyperScroll3D.jsx'

// Mock GSAP
vi.mock('gsap', () => ({
    gsap: {
        to: vi.fn(),
        fromTo: vi.fn(),
        set: vi.fn()
    }
}))

describe('HyperScroll3D Component', () => {
    describe('Rendering', () => {
        it('renders HUD elements', () => {
            render(<HyperScroll3D />)
            expect(screen.getByText('SYS.READY')).toBeInTheDocument()
            expect(screen.getByText(/FPS:/)).toBeInTheDocument()
            expect(screen.getByText(/SCROLL VELOCITY/)).toBeInTheDocument()
            expect(screen.getByText(/COORD:/)).toBeInTheDocument()
            expect(screen.getByText('VER 2.0')).toBeInTheDocument()
        })

        it('renders items', () => {
            const items = [
                <div key="1">Item 1</div>,
                <div key="2">Item 2</div>
            ]
            render(<HyperScroll3D items={items} />)
            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })

        it('renders with custom className', () => {
            const { container } = render(<HyperScroll3D className="custom-hyper" />)
            expect(container.querySelector('.custom-hyper')).toBeInTheDocument()
        })

        it('renders overlay elements', () => {
            const { container } = render(<HyperScroll3D />)
            expect(container.querySelector('.scanlines')).toBeInTheDocument()
            expect(container.querySelector('.vignette')).toBeInTheDocument()
            expect(container.querySelector('.noise-overlay')).toBeInTheDocument()
        })
    })
})

describe('HyperCard Component', () => {
    it('renders with title and id', () => {
        render(<HyperCard id="01" title="Test Card" />)
        expect(screen.getByText('ID-01')).toBeInTheDocument()
        expect(screen.getByText('Test Card')).toBeInTheDocument()
    })

    it('renders children', () => {
        render(
            <HyperCard id="02" title="Child Test">
                <p>Card content</p>
            </HyperCard>
        )
        expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const { container } = render(<HyperCard id="03" title="Class Test" className="custom-card" />)
        expect(container.querySelector('.custom-card')).toBeInTheDocument()
    })
})
