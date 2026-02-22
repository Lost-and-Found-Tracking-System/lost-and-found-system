import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../../../components/Layout.jsx'

// Mock Sidebar
vi.mock('../../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('Layout Component', () => {
    const renderLayout = (children) => {
        return render(
            <BrowserRouter>
                <Layout>{children}</Layout>
            </BrowserRouter>
        )
    }

    it('renders Sidebar', () => {
        renderLayout(<div>Test Content</div>)
        expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('renders children content', () => {
        renderLayout(<div>Test Content</div>)
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders main element', () => {
        renderLayout(<div>Test Content</div>)
        expect(document.querySelector('main')).toBeInTheDocument()
    })

    it('has min-h-screen class on container', () => {
        renderLayout(<div>Test Content</div>)
        expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
    })
})
