import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ReportItem from "../pages/ReportItem";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock Sidebar component
vi.mock("../components/Sidebar", () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock CampusMap component
vi.mock("../components/CampusMap", () => ({
    default: ({ zones, selectedZone, onZoneSelect }) => (
        <div data-testid="campus-map">
            {zones?.map((zone) => (
                <button
                    key={zone._id}
                    data-testid={`zone-${zone._id}`}
                    onClick={() => onZoneSelect({ id: zone._id, coordinates: [0, 0] })}
                >
                    {zone.zoneName}
                </button>
            ))}
        </div>
    ),
}));

// Mock API
vi.mock("../services/api", () => ({
    default: {
        get: vi.fn((url) => {
            if (url === "/v1/zones") {
                return Promise.resolve({
                    data: [
                        { _id: "zone1", zoneName: "Library" },
                        { _id: "zone2", zoneName: "Cafeteria" },
                    ],
                });
            }
            if (url === "/v1/items/drafts/me") {
                return Promise.reject({ response: { status: 404 } });
            }
            return Promise.resolve({ data: [] });
        }),
        post: vi.fn((url, data) => {
            if (url === "/v1/items") {
                return Promise.resolve({ data: { trackingId: "TRK-12345678" } });
            }
            if (url === "/v1/items/drafts") {
                return Promise.resolve({ data: { success: true } });
            }
            return Promise.resolve({ data: {} });
        }),
        delete: vi.fn(() => Promise.resolve({ data: {} })),
    },
}));

describe("ReportItem Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders step 1 with form elements", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("What happened?")).toBeInTheDocument();
        });

        expect(screen.getByText("I lost something")).toBeInTheDocument();
        expect(screen.getByText("I found something")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Documents")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Describe the item in detail...")).toBeInTheDocument();
    });

    test("toggles between lost and found submission type", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("I lost something")).toBeInTheDocument();
        });

        const lostButton = screen.getByText("I lost something");
        const foundButton = screen.getByText("I found something");

        // Default should be lost (has bg-primary-500 class)
        expect(lostButton.className).toContain("bg-primary-500");

        fireEvent.click(foundButton);
        expect(foundButton.className).toContain("bg-primary-500");
    });

    test("selects category", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });

        const electronicsButton = screen.getByText("Electronics");
        fireEvent.click(electronicsButton);

        expect(electronicsButton.className).toContain("bg-primary-500");
    });

    test("navigates to step 2", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Next")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Next"));

        await waitFor(() => {
            expect(screen.getByText("Where and When?")).toBeInTheDocument();
        });
    });

    test("renders step 2 with location and date", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Next")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Next"));

        await waitFor(() => {
            expect(screen.getByTestId("campus-map")).toBeInTheDocument();
        });

        expect(screen.getByText(/submit anonymously/i)).toBeInTheDocument();
    });

    test("navigates back from step 2 to step 1", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Next")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Next"));

        await waitFor(() => {
            expect(screen.getByText("Where and When?")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Back"));

        await waitFor(() => {
            expect(screen.getByText("What happened?")).toBeInTheDocument();
        });
    });

    test("navigates to step 3 (review)", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        // Step 1
        await waitFor(() => {
            expect(screen.getByText("Next")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText("Next"));

        // Step 2
        await waitFor(() => {
            expect(screen.getByText("Where and When?")).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText("Next"));

        // Step 3
        await waitFor(() => {
            expect(screen.getByText("Review & Submit")).toBeInTheDocument();
        });
    });

    test("renders back to dashboard link", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
        });
    });

    test("updates description field", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Describe the item in detail...")).toBeInTheDocument();
        });

        const descriptionInput = screen.getByPlaceholderText("Describe the item in detail...");
        fireEvent.change(descriptionInput, { target: { value: "Lost my black wallet near the library" } });

        expect(descriptionInput.value).toBe("Lost my black wallet near the library");
    });

    test("renders step indicator", async () => {
        render(
            <MemoryRouter>
                <ReportItem />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("1")).toBeInTheDocument();
        });

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});
