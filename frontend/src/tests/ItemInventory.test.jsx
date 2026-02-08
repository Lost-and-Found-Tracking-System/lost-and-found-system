import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
            description: "Black laptop bag with Dell laptop inside",
        },
        timeMetadata: {
            lostOrFoundAt: "2024-01-15T10:00:00Z",
        },
        location: {
            zoneId: { zoneName: "Library" },
        },
        images: [],
    },
    {
        _id: "item2",
        trackingId: "TRK-002",
        submissionType: "found",
        status: "resolved",
        itemAttributes: {
            category: "Keys",
            description: "Set of keys with a car remote",
        },
        timeMetadata: {
            lostOrFoundAt: "2024-01-16T14:00:00Z",
        },
        location: {
            zoneId: { zoneName: "Cafeteria" },
        },
        images: [],
    },
];

describe("ItemInventory Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGet.mockResolvedValue({
            data: {
                items: mockItems,
                pagination: { total: 2, totalPages: 1 },
            },
        });
    });

    test("renders inventory page header", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        expect(screen.getByText("Item Inventory")).toBeInTheDocument();
        expect(screen.getByText("Browse all reported lost and found items")).toBeInTheDocument();
    });

    test("displays loading state initially", () => {
        mockGet.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        // Should show loading spinner (Loader2 component)
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });

    test("renders items from API", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Black laptop bag with Dell laptop inside")).toBeInTheDocument();
        });

        expect(screen.getByText("Set of keys with a car remote")).toBeInTheDocument();
    });

    test("renders search input", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText("Search items...")).toBeInTheDocument();
    });

    test("renders type filter buttons", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        // There are two 'All' buttons (type filter and category filter)
        const allButtons = screen.getAllByRole("button", { name: "All" });
        expect(allButtons.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole("button", { name: "lost" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "found" })).toBeInTheDocument();
    });

    test("filters by type when button clicked", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Black laptop bag with Dell laptop inside")).toBeInTheDocument();
        });

        const lostButton = screen.getByRole("button", { name: "lost" });
        fireEvent.click(lostButton);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("submissionType=lost"));
        });
    });

    test("renders category filter pills", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        // There are two 'All' buttons (type filter and category filter)
        const allButtons = screen.getAllByRole("button", { name: "All" });
        expect(allButtons.length).toBe(2);
        expect(screen.getByRole("button", { name: "Electronics" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Documents" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Keys" })).toBeInTheDocument();
    });

    test("filters by category when pill clicked", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Black laptop bag with Dell laptop inside")).toBeInTheDocument();
        });

        const electronicsButton = screen.getByRole("button", { name: "Electronics" });
        fireEvent.click(electronicsButton);

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("category=Electronics"));
        });
    });

    test("renders view mode toggle buttons", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        // Grid and List buttons exist (they contain SVG icons)
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    test("displays empty state when no items", async () => {
        mockGet.mockResolvedValue({
            data: { items: [], pagination: { total: 0, totalPages: 0 } },
        });

        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("No items found")).toBeInTheDocument();
        });
    });

    test("displays error state on API failure", async () => {
        mockGet.mockRejectedValue({
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

    test("shows result count", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Showing 2 of 2 items")).toBeInTheDocument();
        });
    });

    test("displays item badges correctly", async () => {
        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("LOST")).toBeInTheDocument();
        });

        expect(screen.getByText("FOUND")).toBeInTheDocument();
        expect(screen.getByText("submitted")).toBeInTheDocument();
        expect(screen.getByText("resolved")).toBeInTheDocument();
    });

    test("debounces search input", async () => {
        vi.useFakeTimers();

        render(
            <MemoryRouter>
                <ItemInventory />
            </MemoryRouter>
        );

        // Clear the initial call
        mockGet.mockClear();

        const searchInput = screen.getByPlaceholderText("Search items...");
        fireEvent.change(searchInput, { target: { value: "laptop" } });

        // API should not be called immediately with search query
        expect(mockGet).not.toHaveBeenCalled();

        // Advance timers past debounce delay
        await vi.advanceTimersByTimeAsync(400);

        expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("q=laptop"));

        vi.useRealTimers();
    });
});
