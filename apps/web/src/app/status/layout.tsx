import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status | Hanfani AI",
  description: "Check the availability and status of Hanfani AI services",
};

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
