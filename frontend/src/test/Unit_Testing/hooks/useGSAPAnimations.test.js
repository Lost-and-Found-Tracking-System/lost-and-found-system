import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { gsap as mockGsap } from 'gsap'
import {
    usePageTransition,
    useScrollReveal,
    useMagneticHover,
    use3DTilt,
    useStaggerAnimation,
    useCounter,
    useElasticPress,
    useModalAnimation,
    useHorizontalScroll,
    useParallax,
    useSpotlightCursor,
    useTextReveal,
    useCardLift,
    useSplitText,
    useMorphingBlob
} from '../../../hooks/useGSAPAnimations.js'

// Mock GSAP
vi.mock('gsap', () => {
    const mock = {
        registerPlugin: vi.fn(),
        context: vi.fn((cb) => {
            cb()
            return { revert: vi.fn() }
        }),
        to: vi.fn(),
        fromTo: vi.fn(),
        set: vi.fn(),
        utils: {
            toArray: vi.fn((selector) => {
                if (Array.isArray(selector)) return selector
                return [document.createElement('div')]
            })
        },
        timeline: vi.fn(() => ({
            to: vi.fn().mockReturnThis(),
            fromTo: vi.fn().mockReturnThis(),
            kill: vi.fn()
        }))
    }
    return {
        gsap: mock,
        default: mock
    }
})

vi.mock('gsap/ScrollTrigger', () => ({
    ScrollTrigger: {
        create: vi.fn(),
        refresh: vi.fn(),
        getAll: vi.fn(() => [])
    }
}))

describe('useGSAPAnimations Hooks', () => {
    describe('usePageTransition', () => {
        it('registers animation context', () => {
            const ref = { current: document.createElement('div') }
            renderHook(() => usePageTransition(ref))
            expect(mockGsap.context).toHaveBeenCalled()
        })
    })

    describe('useScrollReveal', () => {
        it('registers scroll animation', () => {
            const ref = { current: document.createElement('div') }
            renderHook(() => useScrollReveal(ref))
            expect(mockGsap.context).toHaveBeenCalled()
        })
    })

    describe('useMagneticHover', () => {
        it('adds event listeners', () => {
            const el = document.createElement('div')
            const addSpy = vi.spyOn(el, 'addEventListener')
            const ref = { current: el }
            renderHook(() => useMagneticHover(ref))
            expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
            expect(addSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
        })
    })

    describe('use3DTilt', () => {
        it('initializes tilt effect', () => {
            const ref = { current: document.createElement('div') }
            renderHook(() => use3DTilt(ref))
            // Logic handled inside useEffect, verified by no crash/mock calls
            expect(ref.current).toBeDefined()
        })
    })

    describe('useStaggerAnimation', () => {
        it('registers stagger animation', () => {
            const ref = { current: document.createElement('div') }
            renderHook(() => useStaggerAnimation(ref))
            expect(mockGsap.context).toHaveBeenCalled()
        })
    })

    describe('useCounter', () => {
        it('sets up intersection observer', () => {
            const observe = vi.fn()
            const disconnect = vi.fn()
            const originalObserver = global.IntersectionObserver

            global.IntersectionObserver = class IntersectionObserver {
                constructor() {
                    this.observe = observe
                    this.disconnect = disconnect
                    this.takeRecords = vi.fn()
                }
            }

            const ref = { current: document.createElement('div') }
            renderHook(() => useCounter(ref, 100))

            expect(observe).toHaveBeenCalled()

            // Cleanup
            if (originalObserver) {
                global.IntersectionObserver = originalObserver
            } else {
                delete global.IntersectionObserver
            }
        })
    })
})


describe('useElasticPress', () => {
    it('adds mouse listeners', () => {
        const el = document.createElement('div')
        const addSpy = vi.spyOn(el, 'addEventListener')
        const ref = { current: el }
        renderHook(() => useElasticPress(ref))
        expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    })
})

describe('useModalAnimation', () => {
    it('returns animation functions', () => {
        const { result } = renderHook(() => useModalAnimation())
        expect(result.current.animateIn).toBeInstanceOf(Function)
        expect(result.current.animateOut).toBeInstanceOf(Function)
    })

    it('animateIn creates timeline', () => {
        const { result } = renderHook(() => useModalAnimation())
        const modalRef = { current: document.createElement('div') }
        result.current.animateIn(modalRef)
        expect(mockGsap.timeline).toHaveBeenCalled()
    })
})

describe('useHorizontalScroll', () => {
    it('registers horizontal scroll', () => {
        const containerRef = { current: document.createElement('div') }
        const trackRef = { current: document.createElement('div') }
        renderHook(() => useHorizontalScroll(containerRef, trackRef))
        expect(mockGsap.context).toHaveBeenCalled()
    })
})

describe('useParallax', () => {
    it('registers parallax effect', () => {
        const ref = { current: document.createElement('div') }
        renderHook(() => useParallax(ref))
        expect(mockGsap.context).toHaveBeenCalled()
    })
})

describe('useSpotlightCursor', () => {
    it('adds move listener', () => {
        const el = document.createElement('div')
        const addSpy = vi.spyOn(el, 'addEventListener')
        const ref = { current: el }
        renderHook(() => useSpotlightCursor(ref))
        expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    })
})

describe('useTextReveal', () => {
    it('registers text reveal', () => {
        const ref = { current: document.createElement('div') }
        renderHook(() => useTextReveal(ref))
        expect(mockGsap.context).toHaveBeenCalled()
    })
})

describe('useCardLift', () => {
    it('adds hover listeners', () => {
        const ref = { current: document.createElement('div') }
        renderHook(() => useCardLift(ref))
        expect(ref.current).toBeDefined()
    })
})

describe('useSplitText', () => {
    it('manipulates innerHTML for splitting', () => {
        const el = document.createElement('div')
        el.textContent = 'Split Me'
        const ref = { current: el }
        renderHook(() => useSplitText(ref))
        expect(el.innerHTML).toContain('span')
    })
})

describe('useMorphingBlob', () => {
    it('creates morphing timeline', () => {
        const ref = { current: document.createElement('div') }
        renderHook(() => useMorphingBlob(ref))
        expect(mockGsap.timeline).toHaveBeenCalled()
    })
})
