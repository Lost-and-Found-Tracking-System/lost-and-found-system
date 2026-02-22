import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LogoutConfirmModal from '../../../components/LogoutConfirmModal.jsx'

describe('LogoutConfirmModal Component', () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('When Closed', () => {
        it('renders nothing when isOpen is false', () => {
            const { container } = render(
                <LogoutConfirmModal
                    isOpen={false}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            expect(container.firstChild).toBeNull()
        })
    })

    describe('When Open', () => {
        it('renders modal content when isOpen is true', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
        })

        it('shows logout confirmation message', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument()
        })

        it('renders No button', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            expect(screen.getByText('No')).toBeInTheDocument()
        })

        it('renders Yes button', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            expect(screen.getByText('Yes')).toBeInTheDocument()
        })

        it('calls onClose when No is clicked', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            fireEvent.click(screen.getByText('No'))
            expect(mockOnClose).toHaveBeenCalled()
        })

        it('calls onConfirm when Yes is clicked', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            fireEvent.click(screen.getByText('Yes'))
            expect(mockOnConfirm).toHaveBeenCalled()
        })

        it('calls onClose when backdrop is clicked', () => {
            render(
                <LogoutConfirmModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onConfirm={mockOnConfirm}
                />
            )
            // Click the backdrop (first child of fixed container)
            const backdrop = document.querySelector('.bg-black\\/60')
            fireEvent.click(backdrop)
            expect(mockOnClose).toHaveBeenCalled()
        })
    })
})
