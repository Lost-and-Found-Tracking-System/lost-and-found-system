import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Register from "../pages/Register";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock AuthContext
const mockRegister = vi.fn();
vi.mock("../context/AuthContext", () => ({
    useAuth: () => ({
        register: mockRegister,
    }),
}));

describe("Register Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders registration form with all fields", () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("you@amrita.edu")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g., CB.EN.U4CSE22001")).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
        expect(screen.getByPlaceholderText("+91 9876543210")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g., CSE Department")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    test("renders navigation links", () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
        expect(screen.getByText(/visitor/i)).toBeInTheDocument();
        expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });

    test("shows error when passwords do not match", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "test@example.com" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "Password123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "DifferentPass" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });

        expect(mockRegister).not.toHaveBeenCalled();
    });

    test("shows error when password is too short", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "test@example.com" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "short" } });
        fireEvent.change(passwordInputs[1], { target: { value: "short" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
        });

        expect(mockRegister).not.toHaveBeenCalled();
    });

    test("submits form and navigates to dashboard on success", async () => {
        mockRegister.mockResolvedValue({ role: "student" });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "test@example.com" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "ValidPass123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "ValidPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                fullName: "Test User",
                email: "test@example.com",
                password: "ValidPass123",
                phone: undefined,
                affiliation: undefined,
                institutionalId: undefined,
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        });
    });

    test("displays error message on registration failure", async () => {
        mockRegister.mockRejectedValue({ error: "Email already exists" });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "existing@example.com" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "ValidPass123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "ValidPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(screen.getByText("Email already exists")).toBeInTheDocument();
        });
    });

    test("shows loading state during registration", async () => {
        mockRegister.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ role: "student" }), 100))
        );

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "test@example.com" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "ValidPass123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "ValidPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        expect(screen.getByText("Creating Account...")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    test("toggles password visibility", () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        const passwordField = passwordInputs[0];
        const toggleButton = passwordField.parentElement.querySelector("button");

        expect(passwordField.type).toBe("password");
        fireEvent.click(toggleButton);
        expect(passwordField.type).toBe("text");
    });

    test("includes optional fields in registration", async () => {
        mockRegister.mockResolvedValue({ role: "student" });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John Doe"), {
            target: { value: "Test User" },
        });
        fireEvent.change(screen.getByPlaceholderText("you@amrita.edu"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., CB.EN.U4CSE22001"), {
            target: { value: "CB.EN.U4CSE22001" },
        });
        fireEvent.change(screen.getByPlaceholderText("+91 9876543210"), {
            target: { value: "+91 9876543210" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g., CSE Department"), {
            target: { value: "CSE Department" },
        });

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "ValidPass123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "ValidPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                fullName: "Test User",
                email: "test@example.com",
                password: "ValidPass123",
                phone: "+91 9876543210",
                affiliation: "CSE Department",
                institutionalId: "CB.EN.U4CSE22001",
            });
        });
    });
});
