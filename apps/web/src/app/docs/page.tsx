import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Hanfani AI",
  description: "Hanfani AI documentation and guides",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Documentation
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          Welcome to the Hanfani AI documentation. Feature docs and guides will be
          added here.
        </p>
        <div className="space-y-4">
          <a
            href="/status"
            className="block rounded-lg border border-zinc-200 bg-white px-6 py-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              Status Page
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Check app and API availability
            </p>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-zinc-200 bg-white px-6 py-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              API Documentation (Swagger)
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Interactive API docs
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
