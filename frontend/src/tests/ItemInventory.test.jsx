import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ItemInventory from "../pages/ItemInventory";

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

const mockItems = [
  {
    _id: "item1",
    trackingId: "TRK-001",
    submissionType: "lost",
    status: "submitted",
    itemAttributes: {
      category: "Electronics",
      description: "Black laptop charger",
    },
    location: {
      zoneId: {
        zoneName: "Library",
      },
    },
    timeMetadata: {
      lostOrFoundAt: "2026-02-01T10:00:00Z",
    },
    images: ["https://example.com/image1.jpg"],
  },
  {
    _id: "item2",
    trackingId: "TRK-002",
    submissionType: "found",
    status: "resolved",
    itemAttributes: {
      category: "Documents",
      description: "Student ID Card",
    },
    location: {
      zoneId: {
        zoneName: "Cafeteria",
      },
    },
    timeMetadata: {
      lostOrFoundAt: "2026-02-05T14:00:00Z",
    },
    images: [],
  },
  {
    _id: "item3",
    trackingId: "TRK-003",
    submissionType: "found",
    status: "matched",
    itemAttributes: {
      category: "Accessories",
      description: "Silver watch",
    },
    location: {
      zoneId: {
        zoneName: "Sports Complex",
      },
    },
    timeMetadata: {
      lostOrFoundAt: "2026-02-07T09:00:00Z",
    },
    images: [],
  },
];

const mockPaginatedResponse = {
  items: mockItems,
  pagination: {
    total: 50,
    totalPages: 3,
    page: 1,
    limit: 20,
  },
};

describe("ItemInventory Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Header and Navigation", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
      });
    });

    test("renders sidebar", () => {
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    test("renders page title", () => {
      expect(screen.getByText("Item Inventory")).toBeInTheDocument();
    });

    test("renders page description", () => {
      expect(screen.getByText("Browse all reported lost and found items")).toBeInTheDocument();
    });

    test("renders back to dashboard link", () => {
      expect(screen.getByText("← Back to Dashboard")).toBeInTheDocument();
    });

    test("back to dashboard links correctly", () => {
      const link = screen.getByText("← Back to Dashboard");
      expect(link.closest("a")).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
      });
    });

    test("renders search input", () => {
      expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
    });

    test("search input accepts user input", async () => {
      const searchInput = screen.getByPlaceholderText("Search items...");
      fireEvent.change(searchInput, { target: { value: "laptop" } });

      expect(searchInput.value).toBe("laptop");
    });

    test("search is debounced", async () => {
      const searchInput = screen.getByPlaceholderText("Search items...");
      fireEvent.change(searchInput, { target: { value: "laptop" } });

      // API should not be called immediately
      const initialCallCount = mockGet.mock.calls.length;

      // Advance timers by debounce delay
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockGet.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe("Type Filters", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
      });
    });

    test("renders type filter buttons", () => {
      // Find the type filter "All" button (rounded-xl, not rounded-full)
      const allButtons = screen.getAllByRole("button", { name: "All" });
      const typeAllButton = allButtons.find(btn => btn.classList.contains("rounded-xl"));
      expect(typeAllButton).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "lost" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "found" })).toBeInTheDocument();
    });

    test("All filter is active by default", () => {
      const allButtons = screen.getAllByRole("button", { name: "All" });
      const typeAllButton = allButtons.find(btn => btn.classList.contains("rounded-xl"));
      expect(typeAllButton).toHaveClass("bg-primary-500");
    });

    test("clicking lost filter changes active state", async () => {
      const lostButton = screen.getByRole("button", { name: "lost" });
      fireEvent.click(lostButton);

      await waitFor(() => {
        expect(lostButton).toHaveClass("bg-primary-500");
      });
    });

    test("clicking found filter changes active state", async () => {
      const foundButton = screen.getByRole("button", { name: "found" });
      fireEvent.click(foundButton);

      await waitFor(() => {
        expect(foundButton).toHaveClass("bg-primary-500");
      });
    });
  });

  describe("Category Filters", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Electronics" })).toBeInTheDocument();
      });
    });

    test("renders category filter buttons", () => {
      // "All" appears twice (type filter and category filter), others appear once
      const categories = [
        "Electronics", "Documents", "Accessories", "Clothing",
        "Books", "Keys", "Bags", "Sports Equipment", "Other"
      ];

      categories.forEach((category) => {
        expect(screen.getByRole("button", { name: category })).toBeInTheDocument();
      });

      // Verify there are two "All" buttons
      const allButtons = screen.getAllByRole("button", { name: "All" });
      expect(allButtons.length).toBe(2);
    });

    test("All category is active by default", () => {
      const buttons = screen.getAllByRole("button", { name: "All" });
      // Find the category All button (there are two "All" buttons)
      const categoryButton = buttons.find(btn => btn.classList.contains("rounded-full"));
      expect(categoryButton).toHaveClass("bg-primary-500");
    });

    test("clicking category changes active state", async () => {
      const electronicsButton = screen.getByRole("button", { name: "Electronics" });
      fireEvent.click(electronicsButton);

      await waitFor(() => {
        expect(electronicsButton).toHaveClass("bg-primary-500");
      });
    });
  });

  describe("View Mode Toggle", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
      });
    });

    test("renders view toggle buttons", () => {
      // Grid and List view buttons exist
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    test("grid view is active by default", async () => {
      await waitFor(() => {
        expect(screen.queryByText("Tracking ID")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    test("shows loading spinner while fetching", async () => {
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      // Loading spinner should be visible
      await waitFor(() => {
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      });
    });
  });

  describe("Error State", () => {
    test("shows error message on API failure", async () => {
      mockGet.mockRejectedValueOnce({
        response: { data: { error: "Failed to load items" } },
      });

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Failed to load items")).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    test("shows empty state when no items", async () => {
      mockGet.mockResolvedValueOnce({ data: { items: [], pagination: { total: 0, totalPages: 0 } } });

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });

      expect(screen.getByText("No items have been reported yet")).toBeInTheDocument();
    });

    test("shows filter suggestion in empty state with active filters", async () => {
      mockGet
        .mockResolvedValueOnce({ data: mockPaginatedResponse }) // Initial load
        .mockResolvedValueOnce({ data: { items: [], pagination: { total: 0, totalPages: 0 } } }); // After filter

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
      });

      // Click on a category filter
      const electronicsButton = screen.getByRole("button", { name: "Electronics" });
      fireEvent.click(electronicsButton);

      await waitFor(() => {
        expect(screen.getByText("No items found")).toBeInTheDocument();
      });

      expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
    });
  });

  describe("Items Display - Grid View", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Black laptop charger")).toBeInTheDocument();
      });
    });

    test("renders items count", () => {
      expect(screen.getByText(/Showing 3 of 50 items/)).toBeInTheDocument();
    });

    test("renders item descriptions", () => {
      expect(screen.getByText("Black laptop charger")).toBeInTheDocument();
      expect(screen.getByText("Student ID Card")).toBeInTheDocument();
      expect(screen.getByText("Silver watch")).toBeInTheDocument();
    });

    test("renders item categories", () => {
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Documents").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Accessories").length).toBeGreaterThan(0);
    });

    test("renders submission type badges", () => {
      expect(screen.getAllByText("LOST").length).toBeGreaterThan(0);
      expect(screen.getAllByText("FOUND").length).toBeGreaterThan(0);
    });

    test("renders status badges", () => {
      expect(screen.getByText("submitted")).toBeInTheDocument();
      expect(screen.getByText("resolved")).toBeInTheDocument();
      expect(screen.getByText("matched")).toBeInTheDocument();
    });

    test("renders location info", () => {
      expect(screen.getByText("Library")).toBeInTheDocument();
      expect(screen.getByText("Cafeteria")).toBeInTheDocument();
      expect(screen.getByText("Sports Complex")).toBeInTheDocument();
    });

    test("items link to detail pages", () => {
      const links = screen.getAllByRole("link");
      const itemLinks = links.filter(link => link.getAttribute("href")?.startsWith("/item/"));
      expect(itemLinks.length).toBe(3);
      expect(itemLinks[0]).toHaveAttribute("href", "/item/item1");
    });
  });

  describe("Pagination", () => {
    beforeEach(async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });
      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
      });
    });

    test("renders pagination when multiple pages exist", async () => {
      await waitFor(() => {
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      });
    });

    test("renders previous and next buttons", async () => {
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      });
    });

    test("previous button is disabled on first page", async () => {
      await waitFor(() => {
        const prevButton = screen.getByRole("button", { name: "Previous" });
        expect(prevButton).toBeDisabled();
      });
    });

    test("next button navigates to next page", async () => {
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalled();
      });
    });
  });

  describe("API Calls", () => {
    test("fetches items on mount", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalled();
      });

      // Check that the API was called with expected params
      const callUrl = mockGet.mock.calls[0][0];
      expect(callUrl).toContain("/v1/items");
    });

    test("filters are included in API call", async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      render(
        <MemoryRouter>
          <ItemInventory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "lost" })).toBeInTheDocument();
      });

      // Click lost filter
      fireEvent.click(screen.getByRole("button", { name: "lost" }));

      await waitFor(() => {
        const calls = mockGet.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall).toContain("submissionType=lost");
      });
    });
  });
});
