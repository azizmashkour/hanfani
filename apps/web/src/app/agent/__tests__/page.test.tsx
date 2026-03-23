import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AgentPage from "../page";
import { sendAgentMessage } from "@/actions/agent";

vi.mock("@/actions/agent", () => ({
  sendAgentMessage: vi.fn(),
}));

const mockSendAgentMessage = vi.mocked(sendAgentMessage);

describe("AgentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendAgentMessage.mockResolvedValue("Here are the top trends...");
  });

  it("renders heading and description", () => {
    render(<AgentPage />);
    expect(screen.getByRole("heading", { name: /AI Agent/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Discover what's trending, explore coverage/i)
    ).toBeInTheDocument();
  });

  it("shows start conversation state when no messages", () => {
    render(<AgentPage />);
    expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ask about trending topics, request insights/i)
    ).toBeInTheDocument();
  });

  it("renders suggestion buttons", () => {
    render(<AgentPage />);
    expect(
      screen.getByRole("button", { name: /What's trending in my country/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Summarize the top 5 trends/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Why is \[topic\] trending/i })).toBeInTheDocument();
  });

  it("fills input when suggestion is clicked", () => {
    render(<AgentPage />);
    fireEvent.click(screen.getByRole("button", { name: /What's trending in my country/i }));
    const textarea = screen.getByPlaceholderText(/Ask about trends, coverage/i);
    expect(textarea).toHaveValue("What's trending in my country?");
  });

  it("renders country select and topic input", () => {
    render(<AgentPage />);
    expect(screen.getByLabelText(/Country \(for trends context\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic \(optional/i)).toBeInTheDocument();
  });

  it("renders textarea and send button", () => {
    render(<AgentPage />);
    expect(screen.getByPlaceholderText(/Ask about trends, coverage/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<AgentPage />);
    expect(screen.getByRole("button", { name: /Send/i })).toBeDisabled();
  });

  it("sends message and displays reply", async () => {
    mockSendAgentMessage.mockResolvedValue("Top trends: AI, Climate, Sports.");
    render(<AgentPage />);

    const textarea = screen.getByPlaceholderText(/Ask about trends, coverage/i);
    fireEvent.change(textarea, { target: { value: "What's trending?" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(mockSendAgentMessage).toHaveBeenCalledWith("What's trending?", "US", undefined);
    });
    await waitFor(() => {
      expect(screen.getByText("What's trending?")).toBeInTheDocument();
      expect(screen.getByText("Top trends: AI, Climate, Sports.")).toBeInTheDocument();
    });
  });

  it("sends topic when provided", async () => {
    render(<AgentPage />);

    fireEvent.change(screen.getByLabelText(/Topic \(optional/i), { target: { value: "AI" } });
    fireEvent.change(screen.getByPlaceholderText(/Ask about trends/i), {
      target: { value: "Tell me more" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(mockSendAgentMessage).toHaveBeenCalledWith("Tell me more", "US", "AI");
    });
  });

  it("shows error when sendAgentMessage fails", async () => {
    mockSendAgentMessage.mockRejectedValue(new Error("Network error"));
    render(<AgentPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ask about trends/i), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("does not send when input is empty or whitespace", () => {
    render(<AgentPage />);

    const textarea = screen.getByPlaceholderText(/Ask about trends/i);
    fireEvent.change(textarea, { target: { value: "   " } });
    expect(screen.getByRole("button", { name: /Send/i })).toBeDisabled();
  });
});
