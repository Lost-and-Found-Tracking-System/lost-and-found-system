import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dependencies
vi.mock('react-dom/client', () => ({
    default: {
        createRoot: vi.fn(() => ({
            render: vi.fn()
        }))
    }
}))

vi.mock('../../App', () => ({
    default: () => <div>App</div>
}))

// Mock CSS imports to prevent parsing errors
vi.mock('../../index.css', () => ({}))
vi.mock('../../gsap-effects.css', () => ({}))

describe('main.jsx', () => {
    let originalGetElementById
    let rootElement

    beforeEach(() => {
        // Setup DOM
        rootElement = document.createElement('div')
        rootElement.id = 'root'
        document.body.appendChild(rootElement)

        originalGetElementById = document.getElementById
        document.getElementById = vi.fn().mockReturnValue(rootElement)
    })

    afterEach(() => {
        document.getElementById = originalGetElementById
        document.body.removeChild(rootElement)
        vi.resetModules()
    })

    it('renders App into root element', async () => {
        // Import main.jsx to trigger side effects
        await import('../../main.jsx')

        const ReactDOM = (await import('react-dom/client')).default

        expect(document.getElementById).toHaveBeenCalledWith('root')
        expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement)

        const root = ReactDOM.createRoot.mock.results[0].value
        expect(root.render).toHaveBeenCalled()
    })
})
