import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TrendsPage from "../page";
import { fetchTrends } from "@/actions/trends";

vi.mock("@/actions/trends", () => ({
  fetchTrends: vi.fn(),
}));

const mockFetchTrends = vi.mocked(fetchTrends);

describe("TrendsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchTrends.mockResolvedValue({
      country: "US",
      topics: [
        { title: "Trend 1", search_volume: "100k", days_ongoing: 5 },
        { title: "Trend 2", search_volume: "50k" },
      ],
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
  });

  it("renders and fetches trends", async () => {
    render(<TrendsPage />);
    await waitFor(() => {
      expect(mockFetchTrends).toHaveBeenCalledWith("US", "last_7_days");
    });
    await waitFor(() => {
      expect(screen.getByText("Trend 1")).toBeInTheDocument();
      expect(screen.getByText("Trend 2")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockFetchTrends.mockImplementation(() => new Promise(() => {}));
    render(<TrendsPage />);
    expect(screen.getByText(/Loading trends/i)).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    mockFetchTrends.mockRejectedValue(new Error("Network error"));
    render(<TrendsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Network error|Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("refetches when country changes", async () => {
    render(<TrendsPage />);
    await waitFor(() => expect(mockFetchTrends).toHaveBeenCalledWith("US", "last_7_days"));
    fireEvent.focus(screen.getByLabelText(/Country/i));
    fireEvent.click(screen.getByRole("option", { name: /France \(FR\)/i }));
    await waitFor(() => {
      expect(mockFetchTrends).toHaveBeenCalledWith("FR", "last_7_days");
    });
  });

  it("refetches when filter changes", async () => {
    render(<TrendsPage />);
    await waitFor(() => expect(mockFetchTrends).toHaveBeenCalled());
    const filterSelect = screen.getByLabelText(/Period/i);
    fireEvent.change(filterSelect, { target: { value: "yesterday" } });
    await waitFor(() => {
      expect(mockFetchTrends).toHaveBeenCalledWith("US", "yesterday");
    });
  });
});
