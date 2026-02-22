import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock GSAP to avoid animation issues in tests
// IMPORTANT: gsap.to must fire onComplete callbacks so redirects work in Login etc.
vi.mock('gsap', () => ({
    gsap: {
        context: vi.fn(() => ({ revert: vi.fn() })),
        fromTo: vi.fn(),
        to: vi.fn((target, config) => {
            if (config && typeof config.onComplete === 'function') {
                config.onComplete();
            }
        }),
        from: vi.fn(),
        set: vi.fn(),
        timeline: vi.fn(() => ({
            to: vi.fn(),
            from: vi.fn(),
            fromTo: vi.fn()
        }))
    }
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock GSAP ScrollTrigger
vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {
        getAll: vi.fn(() => []),
        create: vi.fn(),
        refresh: vi.fn(),
        update: vi.fn(),
        kill: vi.fn()
    }
}))
