"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const VIEW_KEY = "hanfani-details-view";
const PAGE_SIZE = 12;

type ViewMode = "list" | "cards";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ES", name: "Spain" },
  { code: "CR", name: "Costa Rica" },
] as const;

interface MentionItem {
  title: string;
  source: string;
  source_type?: string;
  link: string;
  snippet?: string;
  date?: string;
  iso_date?: string;
  authors?: string[];
  thumbnail?: string;
  position?: number;
}

interface MentionsResponse {
  topic: string;
  country: string;
  mentions: MentionItem[];
}

function DetailsContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") || "";
  const countryParam = searchParams.get("country") || "US";

  const [data, setData] = useState<MentionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_KEY) as ViewMode | null;
      if (stored === "list" || stored === "cards") setViewMode(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setView = (v: ViewMode) => {
    setViewMode(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!topicParam) {
      setData(null);
      setError("No topic specified");
      setIsLoading(false);
      return;
    }

    const fetchMentions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          topic: topicParam,
          country: countryParam,
        });
        const res = await fetch(`${API_URL}/trends/mentions?${params}`, {
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
        const json: MentionsResponse = await res.json();
        setData(json);
      } catch (err) {
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to fetch mentions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentions();
  }, [topicParam, countryParam]);

  useEffect(() => {
    setPage(1);
  }, [topicParam, countryParam]);

  if (!topicParam) {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="mb-3 text-[15px] text-amber-800 dark:text-amber-200">
          Select a topic from the trends list to see articles and platforms.
        </p>
        <Link
          href="/trends"
          className="text-[14px] font-medium text-amber-700 underline hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
        >
          ← Back to Trends
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/trends"
          className="text-[14px] font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          ← Back to Trends
        </Link>
        <span className="text-stone-300 dark:text-stone-600">·</span>
        <span className="text-[14px] text-stone-500 dark:text-stone-400">
          {COUNTRIES.find((c) => c.code === countryParam)?.name ?? countryParam}
        </span>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Coverage: {decodeURIComponent(topicParam)}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
            News articles and platforms discussing this topic, ranked by relevance and recency.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-900">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            title="List view"
            className={`inline-flex items-center justify-center rounded-md p-2 transition ${
              viewMode === "list"
                ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-50"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setView("cards")}
            aria-label="Card view"
            title="Card view"
            className={`inline-flex items-center justify-center rounded-md p-2 transition ${
              viewMode === "cards"
                ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-50"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 text-[15px] text-stone-500 dark:text-stone-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-stone-500 dark:border-stone-700 dark:border-t-stone-400" />
          Loading articles...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50 px-6 py-5 text-[15px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
          {error.includes("SERPAPI") || error.includes("401") ? (
            <p className="mt-3 text-[14px]">
              Set SERPAPI_KEY in the API to fetch live news. Get a key at{" "}
              <a
                href="https://serpapi.com/manage-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                serpapi.com
              </a>
            </p>
          ) : null}
        </div>
      )}

      {!isLoading && !error && data && (() => {
          const total = data.mentions.length;
          const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
          const start = (page - 1) * PAGE_SIZE;
          const paginatedMentions = data.mentions.slice(start, start + PAGE_SIZE);
          return (
        <div className="space-y-6">
          <p className="text-[14px] text-stone-500 dark:text-stone-400">
            {total} article
            {total !== 1 ? "s" : ""} and platform
            {total !== 1 ? "s" : ""} found
          </p>

          {viewMode === "list" ? (
            <ul className="space-y-4">
              {paginatedMentions.map((m, j) => {
                const i = start + j;
                return (
                <li
                  key={`${m.link}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-stone-700/80 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-stone-200 transition group-hover:bg-stone-400 dark:bg-stone-600 dark:group-hover:bg-stone-500" />
                  <a
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 pl-6"
                  >
                    <div className="flex gap-5">
                      {m.thumbnail && (
                        <img
                          src={m.thumbnail}
                          alt=""
                          className="h-24 w-32 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-stone-900 dark:text-stone-50 hover:underline">
                          {m.title}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-stone-500 dark:text-stone-400">
                          <span className="font-medium">{m.source}</span>
                          {m.date && <span>· {m.date}</span>}
                          {m.authors && m.authors.length > 0 && (
                            <span>· {m.authors.slice(0, 2).join(", ")}</span>
                          )}
                        </div>
                        {m.snippet && (
                          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-stone-600 dark:text-stone-400">
                            {m.snippet}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                </li>
              );
              })}
            </ul>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedMentions.map((m, j) => {
                const i = start + j;
                return (
                <a
                  key={`${m.link}-${i}`}
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-stone-700/80 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-stone-200 transition group-hover:bg-stone-400 dark:bg-stone-600 dark:group-hover:bg-stone-500" />
                  <div className="flex flex-1 flex-col p-4 pl-5">
                    {m.thumbnail && (
                      <img
                        src={m.thumbnail}
                        alt=""
                        className="mb-3 h-32 w-full rounded-lg object-cover"
                      />
                    )}
                    <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      {m.source}
                    </span>
                    <span className="font-medium text-stone-900 dark:text-stone-50 line-clamp-2 group-hover:text-stone-700 dark:group-hover:text-stone-200">
                      {m.title}
                    </span>
                    {m.date && (
                      <span className="mt-2 text-[13px] text-stone-500 dark:text-stone-400">
                        {m.date}
                      </span>
                    )}
                    {m.snippet && (
                      <p className="mt-2 line-clamp-2 text-[13px] text-stone-500 dark:text-stone-400">
                        {m.snippet}
                      </p>
                    )}
                  </div>
                </a>
              );
              })}
            </div>
          )}

          {total === 0 ? (
            <p className="rounded-2xl bg-white px-8 py-12 text-center text-[15px] text-stone-500 dark:bg-stone-900 dark:text-stone-400">
              No articles found for this topic. Try a different country or check that SERPAPI_KEY is set.
            </p>
          ) : totalPages > 1 ? (
            <nav className="flex items-center justify-between border-t border-stone-200 pt-6 dark:border-stone-700">
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-700 transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-700 transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </div>
          );
        })()}
    </div>
  );
}

export default function TrendDetailsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-14">
        <Suspense
          fallback={
            <div className="flex items-center gap-3 text-[15px] text-stone-500 dark:text-stone-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-stone-500" />
              Loading...
            </div>
          }
        >
          <DetailsContent />
        </Suspense>
      </main>
    </div>
  );
}
