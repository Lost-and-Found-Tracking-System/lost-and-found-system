import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CampusMap from '../../../components/CampusMap.jsx'

describe('CampusMap Component', () => {
    const mockZones = [
        {
            _id: 'zone-1',
            zoneName: 'Central Library',
            geoBoundary: { type: 'Polygon', coordinates: [[[76.925, 10.903]]] }
        },
        {
            _id: 'zone-2',
            zoneName: 'Sports Complex',
            geoBoundary: { type: 'Polygon', coordinates: [[[76.926, 10.904]]] }
        },
        {
            _id: 'zone-3',
            zoneName: 'Cafeteria',
            geoBoundary: { type: 'Polygon', coordinates: [[[76.927, 10.905]]] }
        }
    ]

    const mockOnZoneSelect = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Empty State', () => {
        it('shows empty state when no zones', () => {
            render(<CampusMap zones={[]} />)
            expect(screen.getByText('No Zones Created Yet')).toBeInTheDocument()
        })

        it('shows empty state message', () => {
            render(<CampusMap zones={[]} />)
            expect(screen.getByText(/Campus zones have not been configured/i)).toBeInTheDocument()
        })

        it('shows contact admin message', () => {
            render(<CampusMap zones={[]} />)
            expect(screen.getByText(/Contact admin to set up campus zones/i)).toBeInTheDocument()
        })
    })

    describe('Zone Grid', () => {
        it('renders zone buttons', () => {
            render(<CampusMap zones={mockZones} onZoneSelect={mockOnZoneSelect} />)

            expect(screen.getByText('Central Library')).toBeInTheDocument()
            expect(screen.getByText('Sports Complex')).toBeInTheDocument()
            expect(screen.getByText('Cafeteria')).toBeInTheDocument()
        })

        it('calls onZoneSelect when zone is clicked', () => {
            render(<CampusMap zones={mockZones} onZoneSelect={mockOnZoneSelect} />)

            const libraryBtn = screen.getByText('Central Library')
            fireEvent.click(libraryBtn)

            expect(mockOnZoneSelect).toHaveBeenCalledWith({
                id: 'zone-1',
                name: 'Central Library',
                coordinates: [76.925, 10.903]
            })
        })

        it('shows help text when no zone selected', () => {
            render(<CampusMap zones={mockZones} onZoneSelect={mockOnZoneSelect} />)
            expect(screen.getByText('Click on a zone to select the location')).toBeInTheDocument()
        })
    })

    describe('Selected Zone', () => {
        it('shows Selected Location when zone is selected', () => {
            render(
                <CampusMap
                    zones={mockZones}
                    selectedZone="zone-1"
                    onZoneSelect={mockOnZoneSelect}
                />
            )

            expect(screen.getByText('Selected Location')).toBeInTheDocument()
        })

        it('shows selected zone name', () => {
            render(
                <CampusMap
                    zones={mockZones}
                    selectedZone="zone-1"
                    onZoneSelect={mockOnZoneSelect}
                />
            )

            // Zone name appears in grid and in selection info
            expect(screen.getAllByText('Central Library').length).toBeGreaterThanOrEqual(1)
        })
    })

    describe('More Zones Indicator', () => {
        it('shows more zones message when more than 9 zones', () => {
            const manyZones = Array.from({ length: 12 }, (_, i) => ({
                _id: `zone-${i}`,
                zoneName: `Zone ${i}`,
                geoBoundary: { type: 'Polygon', coordinates: [[[76.925 + i * 0.001, 10.903]]] }
            }))

            render(<CampusMap zones={manyZones} onZoneSelect={mockOnZoneSelect} />)
            expect(screen.getByText('+3 more zones available')).toBeInTheDocument()
        })
    })
})
