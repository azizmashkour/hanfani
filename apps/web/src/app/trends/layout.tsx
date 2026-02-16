import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Topics | Hanfani AI",
  description: "Top Google Trends by country - identify what's relevant to your audience",
};

export default function TrendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
