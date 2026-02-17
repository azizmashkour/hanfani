"use client";

import { useEffect, useState } from "react";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import { TrendsFilters } from "@/components/trends/TrendsFilters";
import { TrendsContent } from "@/components/trends/TrendsContent";
import {
  fetchTrends,
  type TrendsResponse,
  type TrendsFilter,
  type TrendItem,
} from "@/actions/trends";

const VIEW_KEY = "hanfani-trends-view";
const FILTER_KEY = "hanfani-trends-filter";
const MOST_RELEVANT_KEY = "hanfani-trends-most-relevant";
const PAGE_SIZE = 10;

function normalizeTopic(topic: TrendItem | string): TrendItem {
  return typeof topic === "string" ? { title: topic } : topic;
}

function isMostRelevant(t: TrendItem): t is TrendItem & { days_ongoing: number } {
  return typeof t === "object" && (t.days_ongoing ?? 0) >= 3;
}

export default function TrendsPage() {
  const [country, setCountry] = useState("US");
  const [filter, setFilter] = useState<TrendsFilter>("last_7_days");
  const [filterByMostRelevant, setFilterByMostRelevant] = useState(false);
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_KEY) as ViewMode | null;
      if (stored === "list" || stored === "cards") setViewMode(stored);
      const f = localStorage.getItem(FILTER_KEY) as TrendsFilter | null;
      if (f === "yesterday" || f === "last_7_days") setFilter(f);
      const mr = localStorage.getItem(MOST_RELEVANT_KEY);
      setFilterByMostRelevant(mr === "true");
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

  const setFilterAndStore = (f: TrendsFilter) => {
    setFilter(f);
    try {
      localStorage.setItem(FILTER_KEY, f);
    } catch {
      /* ignore */
    }
  };

  const setMostRelevantAndStore = (v: boolean) => {
    setFilterByMostRelevant(v);
    try {
      localStorage.setItem(MOST_RELEVANT_KEY, v ? "true" : "false");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchTrends(country, filter)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to fetch trends");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, filter]);

  useEffect(() => {
    setPage(1);
  }, [country, filter, filterByMostRelevant]);

  const allTopics = data
    ? (filterByMostRelevant
        ? data.topics.filter((t) => isMostRelevant(normalizeTopic(t)))
        : data.topics
      ).map(normalizeTopic)
    : [];
  const total = allTopics.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedTopics = allTopics.slice(start, start + PAGE_SIZE);
  const showMostRelevantToggle =
    filter === "last_7_days" &&
    !!data?.topics?.some((t) => isMostRelevant(normalizeTopic(t)));

  return (
    <div
      className="flex flex-1 flex-col overflow-auto bg-stone-50 dark:bg-stone-950"
    >
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-14">
        <h1
          className={
            "mb-2 text-[28px] font-semibold tracking-tight " +
            "text-stone-900 dark:text-stone-50"
          }
        >
          Trending Topics
        </h1>
        <p
          className={
            "mb-10 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400"
          }
        >
          Top Google Trends for your audience. Select a country to see what&apos;s
          trending.
        </p>

        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <TrendsFilters
            country={country}
            onCountryChange={setCountry}
            filter={filter}
            onFilterChange={setFilterAndStore}
            filterByMostRelevant={filterByMostRelevant}
            onFilterByMostRelevantChange={setMostRelevantAndStore}
            showMostRelevantToggle={showMostRelevantToggle}
          />
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
            Loading trends...
          </div>
        )}

        {error && (
          <div
            className={
              "rounded-xl border border-red-200/80 bg-red-50 px-5 py-4 " +
              "text-[15px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 " +
              "dark:text-red-200"
            }
          >
            {error}
          </div>
        )}

        {!isLoading && !error && data && (
          <TrendsContent
            topics={paginatedTopics}
            startIndex={start}
            country={country}
            viewMode={viewMode}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            isMostRelevant={(t) => isMostRelevant(t)}
            filterByMostRelevant={filterByMostRelevant}
            data={data}
          />
        )}
      </main>
    </div>
  );
}
