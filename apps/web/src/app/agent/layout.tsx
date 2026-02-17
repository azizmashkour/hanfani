import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent | Hanfani AI",
  description:
    "Discover what's trending, explore coverage across news and " +
    "platforms, and stay ahead with autonomous AI agents.",
};

export default function AgentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
