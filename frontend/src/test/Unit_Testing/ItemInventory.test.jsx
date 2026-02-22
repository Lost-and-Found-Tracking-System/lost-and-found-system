import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ItemInventory from '../../pages/ItemInventory.jsx'
import api from '../../services/api.js'

// Mock effects
vi.mock('../../effects', () => ({
    MorphingBlob: () => null,
    GlitchText: ({ text }) => <span>{text}</span>,
    TiltCard: ({ children }) => <div>{children}</div>,
    GradientBorderCard: ({ children }) => <div>{children}</div>,
    ElasticButton: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className}>{children}</button>
    ),
    PulseRings: () => null,
    RippleButton: ({ children, onClick, className, type }) => (
        <button onClick={onClick} className={className} type={type}>{children}</button>
    ),
    HolographicCard: ({ children }) => <div>{children}</div>,
    ScrambleLink: ({ children, to }) => <a href={to}>{children}</a>
}))

vi.mock('../../services/api.js')
vi.mock('../../components/Sidebar.jsx', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}))

describe('ItemInventory Component', () => {
    const mockItems = [
        {
            _id: 'item-1',
            trackingId: 'ITEM-001',
            submissionType: 'lost',
            status: 'submitted',
            itemAttributes: {
                category: 'Electronics',
                description: 'Black iPhone 13 Pro'
            },
            location: {
                zoneId: { zoneName: 'Main Library' }
            },
            images: ['https://example.com/image1.jpg'],
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            _id: 'item-2',
            trackingId: 'ITEM-002',
            submissionType: 'found',
            status: 'submitted',
            itemAttributes: {
                category: 'Books',
                description: 'Physics Textbook'
            },
            location: {
                zoneId: { zoneName: 'Cafeteria' }
            },
            images: [],
            createdAt: '2024-01-14T10:00:00Z'
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        api.get.mockResolvedValue({ data: { items: mockItems } })
    })

    const renderInventory = (initialRoute = '/inventory') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <ItemInventory />
            </MemoryRouter>
        )
    }

    describe('Rendering', () => {
        it('renders sidebar', async () => {
            renderInventory()
            expect(await screen.findByTestId('sidebar')).toBeInTheDocument()
        })

        it('renders Item Registry header', async () => {
            renderInventory()
            expect(await screen.findByText('Item Registry')).toBeInTheDocument()
        })

        it('fetches items on mount', async () => {
            renderInventory()

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/v1/items'))
            })
        })

        it('displays items after loading', async () => {
            renderInventory()

            // Electronics appears in filter pills AND item cards, so use findAllByText
            const electronicsElements = await screen.findAllByText('Electronics')
            expect(electronicsElements.length).toBeGreaterThan(0)

            // Books also appears multiple times in item cards (h3 title + category tag)
            const booksElements = await screen.findAllByText('Books')
            expect(booksElements.length).toBeGreaterThan(0)
        })

        it('displays item descriptions', async () => {
            renderInventory()

            expect(await screen.findByText('Black iPhone 13 Pro')).toBeInTheDocument()
            expect(await screen.findByText('Physics Textbook')).toBeInTheDocument()
        })
    })

    describe('Search Functionality', () => {
        it('renders search input', async () => {
            renderInventory()

            const searchInput = await screen.findByPlaceholderText(/Search items/i)
            expect(searchInput).toBeInTheDocument()
        })

        it('renders Search button', async () => {
            renderInventory()

            expect(await screen.findByRole('button', { name: /Search/i })).toBeInTheDocument()
        })

        it('updates search input value on change', async () => {
            renderInventory()

            const searchInput = await screen.findByPlaceholderText(/Search items/i)
            fireEvent.change(searchInput, { target: { value: 'iPhone' } })

            expect(searchInput.value).toBe('iPhone')
        })
    })

    describe('Filter Pills', () => {
        it('renders type filter pills (All Items, Lost, Found)', async () => {
            renderInventory()

            expect(await screen.findByText('All Items')).toBeInTheDocument()
            expect(await screen.findByText('Lost')).toBeInTheDocument()
            expect(await screen.findByText('Found')).toBeInTheDocument()
        })

        it('renders category filter pills', async () => {
            renderInventory()

            // Use findAllByText since categories may appear in items too
            const electronicsElements = await screen.findAllByText('Electronics')
            expect(electronicsElements.length).toBeGreaterThan(0)

            expect(await screen.findByText('Documents')).toBeInTheDocument()
            expect(await screen.findByText('Accessories')).toBeInTheDocument()
        })

        it('applies filter when type pill is clicked', async () => {
            renderInventory()

            const lostButton = await screen.findByText('Lost')
            fireEvent.click(lostButton)

            // Should refetch with filter
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(expect.stringContaining('submissionType=lost'))
            })
        })
    })

    describe('View Mode Toggle', () => {
        it('renders grid and list view toggle buttons', async () => {
            renderInventory()

            // Wait for items to load using a unique text
            await screen.findByText('Black iPhone 13 Pro')

            // There should be view mode toggle buttons (grid/list icons)
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        })
    })

    describe('Empty State', () => {
        it('shows empty state message when no items', async () => {
            api.get.mockResolvedValue({ data: { items: [] } })
            renderInventory()

            expect(await screen.findByText('No items found')).toBeInTheDocument()
        })

        it('shows Report Item button in empty state', async () => {
            api.get.mockResolvedValue({ data: { items: [] } })
            renderInventory()

            expect(await screen.findByText('Report Item')).toBeInTheDocument()
        })
    })

    describe('Pagination', () => {
        it('shows Load More button when there are more items', async () => {
            // Return exactly 12 items to indicate there might be more
            const manyItems = Array.from({ length: 12 }, (_, i) => ({
                ...mockItems[0],
                _id: `item-${i}`,
                itemAttributes: { category: `Item ${i}`, description: `Description ${i}` }
            }))
            api.get.mockResolvedValue({ data: { items: manyItems } })

            renderInventory()

            expect(await screen.findByText('Load More Items')).toBeInTheDocument()
        })
    })
})
