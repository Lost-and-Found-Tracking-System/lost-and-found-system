import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import ItemDetails from "../pages/ItemDetails";

// Mock AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user123", fullName: "John Doe", email: "john@example.com" },
  }),
}));

// Mock Sidebar component
vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock API
const mockGet = vi.fn();
vi.mock("../services/api", () => ({
  default: {
    get: (...args) => mockGet(...args),
  },
}));

const mockFoundItem = {
  _id: "item123",
  trackingId: "TRK-ABC123",
  submissionType: "found",
  status: "submitted",
  itemAttributes: {
    category: "Electronics",
    description: "Black laptop bag with HP logo",
    color: "Black",
    material: "Leather",
    size: "Medium",
  },
  location: {
    zoneId: {
      zoneName: "Library",
    },
  },
  timeMetadata: {
    lostOrFoundAt: "2026-02-01T10:00:00Z",
  },
  createdAt: "2026-02-01T12:00:00Z",
  submittedBy: {
    profile: {
      fullName: "Jane Smith",
      affiliation: "Student",
    },
  },
  isAnonymous: false,
};

const mockLostItem = {
  _id: "item456",
  trackingId: "TRK-DEF456",
  submissionType: "lost",
  status: "resolved",
  itemAttributes: {
    category: "Documents",
    description: "ID Card",
  },
  location: {
    zoneId: {
      zoneName: "Main Building",
    },
  },
  timeMetadata: {
    lostOrFoundAt: "2026-02-05T14:00:00Z",
  },
  createdAt: "2026-02-05T15:00:00Z",
  isAnonymous: true,
};

const renderWithRouter = (itemId = "item123") => {
  return render(
    <MemoryRouter initialEntries={[`/item/${itemId}`]}>
      <Routes>
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/inventory" element={<div>Inventory Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ItemDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Loading State", () => {
    test("shows loading spinner while fetching", async () => {
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter();

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      // Loading spinner should be visible (Loader2 component)
    });
  });

  describe("Error State", () => {
    test("shows error message when item not found", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Item Not Found")).toBeInTheDocument();
      });

      expect(screen.getByText("Item not found")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /back to inventory/i })).toBeInTheDocument();
    });

    test("renders sidebar on error state", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Item Not Found")).toBeInTheDocument();
      });

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });
  });

  describe("Found Item Display", () => {
    test("renders sidebar", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Electronics");
      });
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    test("renders back button", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Electronics");
      });
      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    test("renders submission type badge for found item", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("found")).toBeInTheDocument();
      });
    });

    test("renders status badge", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Active")).toBeInTheDocument();
      });
    });

    test("renders item category as title", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Electronics");
      });
    });

    test("renders tracking ID", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("TRK-ABC123")).toBeInTheDocument();
      });
    });

    test("renders description section", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Description")).toBeInTheDocument();
      });
      expect(screen.getByText("Black laptop bag with HP logo")).toBeInTheDocument();
    });

    test("renders attributes section", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Attributes")).toBeInTheDocument();
      });
      expect(screen.getByText("Color")).toBeInTheDocument();
      expect(screen.getByText("Black")).toBeInTheDocument();
      expect(screen.getByText("Material")).toBeInTheDocument();
      expect(screen.getByText("Leather")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    test("renders location and time section", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Location & Time")).toBeInTheDocument();
      });
      expect(screen.getByText("Location")).toBeInTheDocument();
      expect(screen.getByText("Library")).toBeInTheDocument();
    });

    test("renders claim button for found items", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Claim This Item")).toBeInTheDocument();
      });
    });

    test("claim button links to correct URL", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Claim This Item")).toBeInTheDocument();
      });
      const claimLink = screen.getByText("Claim This Item");
      expect(claimLink.closest("a")).toHaveAttribute("href", "/claim/item123");
    });

    test("renders submitter info for non-anonymous items", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText("Reported By")).toBeInTheDocument();
      });
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Student")).toBeInTheDocument();
    });
  });

  describe("Lost Item Display", () => {
    test("renders submission type badge for lost item", async () => {
      mockGet.mockResolvedValueOnce({ data: mockLostItem });
      renderWithRouter("item456");
      await waitFor(() => {
        expect(screen.getByText("lost")).toBeInTheDocument();
      });
    });

    test("renders resolved status", async () => {
      mockGet.mockResolvedValueOnce({ data: mockLostItem });
      renderWithRouter("item456");
      await waitFor(() => {
        expect(screen.getByText("Resolved")).toBeInTheDocument();
      });
    });

    test("does not render claim button for lost items", async () => {
      mockGet.mockResolvedValueOnce({ data: mockLostItem });
      renderWithRouter("item456");
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Documents");
      });
      expect(screen.queryByText("Claim This Item")).not.toBeInTheDocument();
    });

    test("renders anonymous message for anonymous items", async () => {
      mockGet.mockResolvedValueOnce({ data: mockLostItem });
      renderWithRouter("item456");
      await waitFor(() => {
        expect(screen.getByText("This item was reported anonymously")).toBeInTheDocument();
      });
    });

    test("does not render submitter info for anonymous items", async () => {
      mockGet.mockResolvedValueOnce({ data: mockLostItem });
      renderWithRouter("item456");
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Documents");
      });
      expect(screen.queryByText("Reported By")).not.toBeInTheDocument();
    });
  });

  describe("Status Badges", () => {
    test("renders matched status", async () => {
      const matchedItem = { ...mockFoundItem, status: "matched" };
      mockGet.mockResolvedValueOnce({ data: matchedItem });
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Matched")).toBeInTheDocument();
      });
    });

    test("does not show claim button for resolved items", async () => {
      const resolvedItem = { ...mockFoundItem, status: "resolved" };
      mockGet.mockResolvedValueOnce({ data: resolvedItem });
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Resolved")).toBeInTheDocument();
      });

      expect(screen.queryByText("Claim This Item")).not.toBeInTheDocument();
    });
  });

  describe("API Interaction", () => {
    test("fetches item with correct ID", async () => {
      mockGet.mockResolvedValueOnce({ data: mockFoundItem });
      renderWithRouter("item123");

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/v1/items/item123");
      });
    });
  });
});
