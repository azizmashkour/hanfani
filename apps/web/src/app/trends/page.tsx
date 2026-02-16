"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const VIEW_KEY = "hanfani-trends-view";
const PAGE_SIZE = 10;

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

interface TrendItem {
  title: string;
  search_volume?: string;
  started?: string;
}

interface TrendsResponse {
  country: string;
  topics: TrendItem[] | string[];
  source?: "api" | "fallback" | "db" | "scraper" | "serpapi";
  fetched_at?: string;
}

export default function TrendsPage() {
  const [country, setCountry] = useState("US");
  const [data, setData] = useState<TrendsResponse | null>(null);
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
    const fetchTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/trends?country=${country}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
        const json: TrendsResponse = await res.json();
        setData(json);
      } catch (err) {
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to fetch trends");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [country]);

  useEffect(() => {
    setPage(1);
  }, [country]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-14">
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Trending Topics
        </h1>
        <p className="mb-10 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
          Top Google Trends for your audience. Select a country to see what&apos;s
          trending.
        </p>

        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-[13px] font-medium text-stone-700 dark:text-stone-300"
            >
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-[14px] text-stone-900 transition focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200/50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:focus:border-stone-600 dark:focus:ring-stone-600/30"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
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
            Loading trends...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200/80 bg-red-50 px-5 py-4 text-[15px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && data && (() => {
          const total = data.topics.length;
          const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
          const start = (page - 1) * PAGE_SIZE;
          const paginatedTopics = data.topics.slice(start, start + PAGE_SIZE);
          return (
          <div className="space-y-6">
            <p className="text-[14px] text-stone-500 dark:text-stone-400">
              {total} trending topic
              {total !== 1 ? "s" : ""} in {data.country}
              {data.source === "fallback" && (
                <span className="ml-2 rounded-lg bg-amber-100 px-2 py-0.5 text-[13px] text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  Sample data
                </span>
              )}
              {data.source === "db" && data.fetched_at && (
                <span className="ml-2 text-stone-400 dark:text-stone-500">
                  Cached {new Date(data.fetched_at).toLocaleString()}
                </span>
              )}
            </p>

            {viewMode === "list" ? (
              <ul className="mx-auto max-w-2xl space-y-3">
                {paginatedTopics.map((topic, j) => {
                  const i = start + j;
                  const t = typeof topic === "string" ? { title: topic } : topic;
                  const detailsUrl = `/trends/details?topic=${encodeURIComponent(t.title)}&country=${country}`;
                  return (
                    <li
                      key={`${t.title}-${i}`}
                      className="rounded-2xl bg-white shadow-sm transition hover:shadow-md dark:bg-stone-900 dark:shadow-stone-950/50 dark:hover:shadow-stone-900/50"
                    >
                      <Link
                        href={detailsUrl}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-[14px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block font-medium text-stone-900 dark:text-stone-50">
                            {t.title}
                          </span>
                          {(t.search_volume || t.started) && (
                            <span className="mt-0.5 block text-[13px] text-stone-500 dark:text-stone-400">
                              {[t.search_volume, t.started].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-[13px] text-stone-400 dark:text-stone-500">
                          View coverage →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedTopics.map((topic, j) => {
                  const i = start + j;
                  const t = typeof topic === "string" ? { title: topic } : topic;
                  const detailsUrl = `/trends/details?topic=${encodeURIComponent(t.title)}&country=${country}`;
                  return (
                    <Link
                      key={`${t.title}-${i}`}
                      href={detailsUrl}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-stone-700/80 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-stone-200 transition group-hover:bg-stone-400 dark:bg-stone-600 dark:group-hover:bg-stone-500" />
                      <div className="flex flex-1 flex-col p-4 pl-5">
                        <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                          #{i + 1}
                        </span>
                        <span className="font-medium text-stone-900 dark:text-stone-50 group-hover:text-stone-700 dark:group-hover:text-stone-200">
                          {t.title}
                        </span>
                        {(t.search_volume || t.started) && (
                          <span className="mt-2 text-[13px] text-stone-500 dark:text-stone-400">
                            {[t.search_volume, t.started].filter(Boolean).join(" · ")}
                          </span>
                        )}
                        <span className="mt-3 text-[13px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300">
                          View coverage →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {total === 0 ? (
              <p className="mx-auto max-w-2xl rounded-2xl bg-white px-6 py-10 text-center text-[15px] text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                No trending topics available for this country right now.
              </p>
            ) : totalPages > 1 ? (
              <nav className={`flex items-center justify-between border-t border-stone-200 pt-6 dark:border-stone-700 ${viewMode === "list" ? "mx-auto max-w-2xl" : ""}`}>
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
      </main>
    </div>
  );
}
