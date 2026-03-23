import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Hanfani AI",
  description: "Hanfani AI documentation and guides",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans dark:bg-stone-950">
      <main className="mx-auto max-w-3xl px-8 py-16">
        <h1
          className={
            "mb-3 text-[28px] font-semibold tracking-tight " +
            "text-stone-900 dark:text-stone-50"
          }
        >
          Documentation
        </h1>
        <p className="mb-10 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
          Welcome to the Hanfani AI documentation. Feature docs and guides will be
          added here.
        </p>
        <div className="space-y-3">
          <a
            href="/status"
            className={
              "block rounded-2xl bg-white px-6 py-5 shadow-sm transition " +
              "hover:shadow-md dark:bg-stone-900 dark:shadow-stone-950/50 " +
              "dark:hover:shadow-stone-900/50"
            }
          >
            <h2 className="font-medium text-stone-900 dark:text-stone-50">
              Status Page
            </h2>
            <p className="mt-1.5 text-[14px] text-stone-500 dark:text-stone-400">
              Check app and API availability
            </p>
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "block rounded-2xl bg-white px-6 py-5 shadow-sm transition " +
              "hover:shadow-md dark:bg-stone-900 dark:shadow-stone-950/50 " +
              "dark:hover:shadow-stone-900/50"
            }
          >
            <h2 className="font-medium text-stone-900 dark:text-stone-50">
              API Documentation (Swagger)
            </h2>
            <p className="mt-1.5 text-[14px] text-stone-500 dark:text-stone-400">
              Interactive API docs
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
