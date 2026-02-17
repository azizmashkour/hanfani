import { render, screen } from "@testing-library/react";
import { TopicCard } from "../TopicCard";

describe("TopicCard", () => {
  it("renders topic title and link", () => {
    render(
      <TopicCard
        topic={{ title: "AI Trends" }}
        index={0}
        country="US"
        isMostRelevant={false}
      />
    );
    expect(screen.getByText("AI Trends")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /AI Trends/i });
    expect(link).toHaveAttribute("href", "/trends/details?topic=AI%20Trends&country=US");
  });

  it("renders most relevant badge when isMostRelevant and days_ongoing", () => {
    render(
      <TopicCard
        topic={{ title: "Climate", days_ongoing: 5 }}
        index={1}
        country="GB"
        isMostRelevant={true}
      />
    );
    expect(screen.getByText("Climate")).toBeInTheDocument();
    expect(screen.getByText("Most relevant")).toBeInTheDocument();
  });

  it("renders search volume and started when present", () => {
    render(
      <TopicCard
        topic={{ title: "Tech", search_volume: "100k", started: "2 days ago" }}
        index={2}
        country="US"
        isMostRelevant={false}
      />
    );
    expect(screen.getByText("100k · 2 days ago")).toBeInTheDocument();
  });
});
