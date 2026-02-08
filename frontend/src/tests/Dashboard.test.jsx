import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Dashboard from "../pages/Dashboard";

// Mock AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { fullName: "John Doe", email: "john@example.com" },
  }),
}));

// Mock Sidebar component
vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock API
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "/v1/items/user/my-items") {
        return Promise.resolve({
          data: [
            {
              _id: "1",
              itemAttributes: { description: "Lost wallet", category: "Wallet" },
              status: "pending",
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      if (url === "/v1/claims/user/my-claims") {
        return Promise.resolve({
          data: [
            {
              _id: "1",
              itemId: { trackingId: "TRK-001" },
              status: "pending",
              submittedAt: new Date().toISOString(),
            },
          ],
        });
      }
      if (url === "/v1/notifications") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

describe("Dashboard Component", () => {
  test("renders dashboard with welcome message", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
  });

  test("renders stats cards", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("My Items").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Pending Claims")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  test("renders quick action links", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Report Lost/Found Item")).toBeInTheDocument();
    });

    expect(screen.getByText("Browse Items")).toBeInTheDocument();
  });

  test("renders sidebar", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });

  test("displays my items section", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lost wallet/)).toBeInTheDocument();
    });
  });

  test("displays my claims section", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("My Claims")).toBeInTheDocument();
    });

    expect(screen.getByText("TRK-001")).toBeInTheDocument();
  });
});
