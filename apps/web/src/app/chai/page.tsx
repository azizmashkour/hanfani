import type { Metadata } from "next";
import { ChaiRegistryPageContent } from "@/components/chai/ChaiRegistryPageContent";

export const metadata: Metadata = {
  title: "CHAI Registry · Hanfani AI",
  description:
    "Publish model cards to the Coalition for Health AI registry via the public API.",
};

export default function ChaiRegistryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-stone-50 dark:bg-stone-950">
      <ChaiRegistryPageContent />
    </div>
  );
}
