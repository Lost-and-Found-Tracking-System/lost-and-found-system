import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import LogoutConfirmModal from "../components/LogoutConfirmModal";

describe("LogoutConfirmModal Component", () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders modal when isOpen is true", () => {
        render(
            <LogoutConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to logout?")).toBeInTheDocument();
    });

    test("does not render modal when isOpen is false", () => {
        render(
            <LogoutConfirmModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });

    test("calls onClose when No button is clicked", () => {
        render(
            <LogoutConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const cancelButton = screen.getByRole("button", { name: /no/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onConfirm when Yes button is clicked", () => {
        render(
            <LogoutConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const confirmButton = screen.getByRole("button", { name: /yes/i });
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    test("displays confirmation message", () => {
        render(
            <LogoutConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByText("Are you sure you want to logout?")).toBeInTheDocument();
    });
});
