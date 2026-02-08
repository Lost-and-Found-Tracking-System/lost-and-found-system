import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import VisitorRegister from "../pages/VisitorRegister";

// Mock AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock API
const mockPost = vi.fn();
vi.mock("../services/api", () => ({
  default: {
    post: (...args) => mockPost(...args),
  },
}));

describe("VisitorRegister Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.getItem = vi.fn();
  });

  describe("Step 1 - Phone Number Input", () => {
    test("renders phone number input form", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      expect(screen.getByText("Enter Phone Number")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("+91 9876543210")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
    });

    test("renders visitor registration header", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      expect(screen.getByText("Visitor Registration")).toBeInTheDocument();
      // LOST&FOUND is split across elements, so we check for the h1 containing all parts
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("LOST");
      expect(heading).toHaveTextContent("&");
      expect(heading).toHaveTextContent("FOUND");
    });

    test("renders navigation links", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      expect(screen.getByText("Already have an account? Sign In")).toBeInTheDocument();
      expect(screen.getByText("Student/Faculty? Register here")).toBeInTheDocument();
      expect(screen.getByText("← Back to Home")).toBeInTheDocument();
    });

    test("allows phone number input", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      const phoneInput = screen.getByPlaceholderText("+91 9876543210");
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });

      expect(phoneInput.value).toBe("9876543210");
    });

    test("submits phone number and requests OTP", async () => {
      mockPost.mockResolvedValueOnce({
        data: { message: "OTP sent", expiresIn: 300 },
      });

      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      const phoneInput = screen.getByPlaceholderText("+91 9876543210");
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });

      const sendOtpButton = screen.getByRole("button", { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/v1/auth/visitor/request-otp", {
          phone: "+919876543210",
        });
      });
    });

    test("shows error when OTP request fails", async () => {
      mockPost.mockRejectedValueOnce({
        response: { data: { error: "Invalid phone number" } },
      });

      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      const phoneInput = screen.getByPlaceholderText("+91 9876543210");
      fireEvent.change(phoneInput, { target: { value: "123" } });

      const sendOtpButton = screen.getByRole("button", { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
      });
    });
  });

  describe("Step 2 - OTP Verification", () => {
    beforeEach(async () => {
      mockPost.mockResolvedValueOnce({
        data: { message: "OTP sent", expiresIn: 300 },
      });

      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      // Complete step 1
      const phoneInput = screen.getByPlaceholderText("+91 9876543210");
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });
      fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

      await waitFor(() => {
        expect(screen.getByText("Verify & Complete")).toBeInTheDocument();
      });
    });

    test("renders OTP verification form", async () => {
      expect(screen.getByPlaceholderText("000000")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    });

    test("renders back and verify buttons", async () => {
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
    });

    test("renders resend OTP link", async () => {
      expect(screen.getByText("Didn't receive? Resend OTP")).toBeInTheDocument();
    });

    test("allows OTP input - only numbers up to 6 digits", async () => {
      const otpInput = screen.getByPlaceholderText("000000");
      
      // Try entering letters - should be filtered
      fireEvent.change(otpInput, { target: { value: "abc123def" } });
      expect(otpInput.value).toBe("123");

      // Enter 6 digits
      fireEvent.change(otpInput, { target: { value: "123456" } });
      expect(otpInput.value).toBe("123456");

      // Try entering more than 6 digits - should be truncated
      fireEvent.change(otpInput, { target: { value: "12345678" } });
      expect(otpInput.value).toBe("123456");
    });

    test("allows full name input", async () => {
      const nameInput = screen.getByPlaceholderText("John Doe");
      fireEvent.change(nameInput, { target: { value: "Test User" } });

      expect(nameInput.value).toBe("Test User");
    });

    test("allows email input (optional)", async () => {
      const emailInput = screen.getByPlaceholderText("you@example.com");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput.value).toBe("test@example.com");
    });

    test("back button returns to step 1", async () => {
      const backButton = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText("Enter Phone Number")).toBeInTheDocument();
      });
    });

    test("verify button is disabled when OTP is not 6 digits", async () => {
      const otpInput = screen.getByPlaceholderText("000000");
      fireEvent.change(otpInput, { target: { value: "123" } });

      const verifyButton = screen.getByRole("button", { name: /verify/i });
      expect(verifyButton).toBeDisabled();
    });

    test("submits verification with valid data", async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          accessToken: "test-token",
          refreshToken: "test-refresh",
          userId: "user123",
          expiresAt: new Date().toISOString(),
        },
      });

      const otpInput = screen.getByPlaceholderText("000000");
      const nameInput = screen.getByPlaceholderText("John Doe");
      const emailInput = screen.getByPlaceholderText("you@example.com");

      fireEvent.change(otpInput, { target: { value: "123456" } });
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const verifyButton = screen.getByRole("button", { name: /verify/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/v1/auth/visitor/verify", {
          phone: "+919876543210",
          fullName: "Test User",
          email: "test@example.com",
          otp: "123456",
        });
      });
    });

    test("shows error when verification fails", async () => {
      mockPost.mockRejectedValueOnce({
        response: { data: { error: "Invalid or expired OTP. Please try again." } },
      });

      const otpInput = screen.getByPlaceholderText("000000");
      const nameInput = screen.getByPlaceholderText("John Doe");

      fireEvent.change(otpInput, { target: { value: "000000" } });
      fireEvent.change(nameInput, { target: { value: "Test User" } });

      const verifyButton = screen.getByRole("button", { name: /verify/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid or expired OTP. Please try again.")).toBeInTheDocument();
      });
    });

    test("resend OTP functionality", async () => {
      mockPost.mockResolvedValueOnce({
        data: { message: "OTP resent" },
      });

      const resendButton = screen.getByText("Didn't receive? Resend OTP");
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/v1/auth/visitor/request-otp", {
          phone: "+919876543210",
        });
      });

      await waitFor(() => {
        expect(screen.getByText("OTP resent successfully!")).toBeInTheDocument();
      });
    });
  });

  describe("Step 3 - Success", () => {
    beforeEach(async () => {
      // Mock step 1 - request OTP
      mockPost.mockResolvedValueOnce({
        data: { message: "OTP sent", expiresIn: 300 },
      });

      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      // Complete step 1
      const phoneInput = screen.getByPlaceholderText("+91 9876543210");
      fireEvent.change(phoneInput, { target: { value: "9876543210" } });
      fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

      await waitFor(() => {
        expect(screen.getByText("Verify & Complete")).toBeInTheDocument();
      });

      // Mock step 2 - verify OTP
      mockPost.mockResolvedValueOnce({
        data: {
          accessToken: "test-token",
          refreshToken: "test-refresh",
          userId: "user123456789",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      });

      const otpInput = screen.getByPlaceholderText("000000");
      const nameInput = screen.getByPlaceholderText("John Doe");

      fireEvent.change(otpInput, { target: { value: "123456" } });
      fireEvent.change(nameInput, { target: { value: "Test User" } });

      fireEvent.click(screen.getByRole("button", { name: /verify/i }));

      await waitFor(() => {
        expect(screen.getByText("Registration Complete!")).toBeInTheDocument();
      });
    });

    test("renders success message", async () => {
      expect(screen.getByText("Registration Complete!")).toBeInTheDocument();
      expect(screen.getByText("Your temporary visitor account has been created.")).toBeInTheDocument();
    });

    test("renders redirect message", async () => {
      expect(screen.getByText("Redirecting to dashboard...")).toBeInTheDocument();
    });

    test("renders go to dashboard button", async () => {
      expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
    });

    test("renders warning about temporary account", async () => {
      expect(
        screen.getByText(/Your temporary account will expire in 24 hours/i)
      ).toBeInTheDocument();
    });

    test("renders user info", async () => {
      expect(screen.getByText("User ID:")).toBeInTheDocument();
      expect(screen.getByText("Access Expires:")).toBeInTheDocument();
    });

    test("does not render navigation links on success step", async () => {
      expect(screen.queryByText("Already have an account? Sign In")).not.toBeInTheDocument();
    });

    test("stores token in localStorage on success", async () => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "test-token");
    });
  });

  describe("Info Section", () => {
    test("renders info about temporary accounts", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      expect(
        screen.getByText(/Visitor accounts are temporary and expire after 24 hours/i)
      ).toBeInTheDocument();
    });
  });

  describe("Progress Indicator", () => {
    test("shows progress steps", () => {
      render(
        <MemoryRouter>
          <VisitorRegister />
        </MemoryRouter>
      );

      // There should be 3 progress step indicators
      const container = document.querySelector(".flex.items-center.justify-center.gap-2.mb-8");
      expect(container?.children.length).toBe(3);
    });
  });
});
