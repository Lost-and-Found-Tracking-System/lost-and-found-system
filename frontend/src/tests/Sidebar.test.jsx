import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { vi } from "vitest";
import Sidebar from "../components/Sidebar";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock LogoutConfirmModal
vi.mock("../components/LogoutConfirmModal", () => ({
    default: ({ isOpen, onClose, onConfirm }) =>
        isOpen ? (
            <div data-testid="logout-modal">
                <button onClick={onClose} data-testid="cancel-logout">Cancel</button>
                <button onClick={onConfirm} data-testid="confirm-logout">Logout</button>
            </div>
        ) : null,
}));

// Mock AuthContext - default user
const mockLogout = vi.fn();
let mockUser = { fullName: "John Doe", role: "student" };

vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout,
    }),
}));

describe("Sidebar Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { fullName: "John Doe", role: "student" };
    });

    test("renders navigation links", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        // Navigation items should be present
        expect(screen.getByTitle("Dashboard")).toBeInTheDocument();
        expect(screen.getByTitle("Report Item")).toBeInTheDocument();
        expect(screen.getByTitle("Browse Items")).toBeInTheDocument();
        expect(screen.getByTitle("My Claims")).toBeInTheDocument();
        expect(screen.getByTitle("Notifications")).toBeInTheDocument();
        expect(screen.getByTitle("Profile")).toBeInTheDocument();
    });

    test("renders logout button", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.getByTitle("Logout")).toBeInTheDocument();
    });

    test("opens logout confirmation modal when logout clicked", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        const logoutButton = screen.getByTitle("Logout");
        fireEvent.click(logoutButton);

        expect(screen.getByTestId("logout-modal")).toBeInTheDocument();
    });

    test("closes logout modal when cancel clicked", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        const logoutButton = screen.getByTitle("Logout");
        fireEvent.click(logoutButton);

        expect(screen.getByTestId("logout-modal")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("cancel-logout"));

        expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
    });

    test("calls logout when confirm clicked", async () => {
        mockLogout.mockResolvedValue();

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        const logoutButton = screen.getByTitle("Logout");
        fireEvent.click(logoutButton);

        fireEvent.click(screen.getByTestId("confirm-logout"));

        expect(mockLogout).toHaveBeenCalled();
    });

    test("does not show admin link for regular users", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.queryByTitle("Admin Panel")).not.toBeInTheDocument();
    });

    test("shows admin link for admin users", () => {
        mockUser = { fullName: "Admin User", role: "admin" };

        // Re-render with admin user
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.getByTitle("Admin Panel")).toBeInTheDocument();
    });

    test("shows admin link for delegated admin users", () => {
        mockUser = { fullName: "Delegated Admin", role: "delegated_admin" };

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.getByTitle("Admin Panel")).toBeInTheDocument();
    });

    test("links navigate to correct paths", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        const dashboardLink = screen.getByTitle("Dashboard").closest("a");
        const reportLink = screen.getByTitle("Report Item").closest("a");
        const browseLink = screen.getByTitle("Browse Items").closest("a");
        const claimsLink = screen.getByTitle("My Claims").closest("a");
        const notificationsLink = screen.getByTitle("Notifications").closest("a");
        const profileLink = screen.getByTitle("Profile").closest("a");

        expect(dashboardLink).toHaveAttribute("href", "/dashboard");
        expect(reportLink).toHaveAttribute("href", "/report");
        expect(browseLink).toHaveAttribute("href", "/inventory");
        expect(claimsLink).toHaveAttribute("href", "/my-claims");
        expect(notificationsLink).toHaveAttribute("href", "/notifications");
        expect(profileLink).toHaveAttribute("href", "/profile");
    });

    test("admin link navigates to admin path", () => {
        mockUser = { fullName: "Admin User", role: "admin" };

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        const adminLink = screen.getByTitle("Admin Panel").closest("a");
        expect(adminLink).toHaveAttribute("href", "/admin");
    });
});
