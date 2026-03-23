"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import { MentionsContent } from "@/components/mentions/MentionsContent";
import { fetchMentions, type MentionsResponse } from "@/actions/trends";

const VIEW_KEY = "hanfani-details-view";
const PAGE_SIZE = 12;

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

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchMentions(topicParam, countryParam)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to fetch mentions");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topicParam, countryParam]);

  useEffect(() => {
    setPage(1);
  }, [topicParam, countryParam]);

  if (!topicParam) {
    return (
      <div
        className={
          "rounded-2xl border border-amber-200/80 bg-amber-50 px-6 py-5 " +
          "dark:border-amber-900/50 dark:bg-amber-950/30"
        }
      >
        <p className="mb-3 text-[15px] text-amber-800 dark:text-amber-200">
          Select a topic from the trends list to see articles and platforms.
        </p>
        <Link
          href="/trends"
          className={
            "text-[14px] font-medium text-amber-700 underline " +
            "hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          }
        >
          ← Back to Trends
        </Link>
      </div>
    );
  }

  const total = data?.mentions.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedMentions = (data?.mentions ?? []).slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/trends"
          className={
            "text-[14px] font-medium text-stone-600 hover:text-stone-900 " +
            "dark:text-stone-400 dark:hover:text-stone-100"
          }
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
          <h1
            className={
              "text-[28px] font-semibold tracking-tight " +
              "text-stone-900 dark:text-stone-50"
            }
          >
            Coverage: {decodeURIComponent(topicParam)}
          </h1>
          <p
            className={
              "mt-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400"
            }
          >
            News articles and platforms discussing this topic, ranked by
            relevance and recency.
          </p>
        </div>
        <ViewModeToggle value={viewMode} onChange={setView} />
      </div>

      {isLoading && (
        <div
          className={
            "flex items-center gap-3 text-[15px] text-stone-500 dark:text-stone-400"
          }
        >
          <span
            className={
              "h-4 w-4 animate-spin rounded-full border-2 border-stone-200 " +
              "border-t-stone-500 dark:border-stone-700 dark:border-t-stone-400"
            }
          />
          Loading articles...
        </div>
      )}

      {error && (
        <div
          className={
            "rounded-2xl border border-red-200/80 bg-red-50 px-6 py-5 " +
            "text-[15px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 " +
            "dark:text-red-200"
          }
        >
          {error}
          {(error.includes("SERPAPI") || error.includes("401")) && (
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
          )}
        </div>
      )}

      {!isLoading && !error && data && (
        <MentionsContent
          mentions={paginatedMentions}
          viewMode={viewMode}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default function TrendDetailsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-14">
        <Suspense
          fallback={
            <div
              className={
                "flex items-center gap-3 text-[15px] text-stone-500 dark:text-stone-400"
              }
            >
              <span
                className={
                  "h-4 w-4 animate-spin rounded-full border-2 border-stone-200 " +
                  "border-t-stone-500"
                }
              />
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
