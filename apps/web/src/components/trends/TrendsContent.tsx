"use client";

import { type ViewMode } from "@/components/ViewModeToggle";
import { Pagination } from "@/components/Pagination";
import { TopicListItem } from "./TopicListItem";
import { TopicCard } from "./TopicCard";
import type { TrendItem } from "@/actions/trends";

export interface TrendsContentProps {
  topics: TrendItem[];
  startIndex: number;
  country: string;
  viewMode: ViewMode;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  isMostRelevant: (t: TrendItem) => boolean;
  filterByMostRelevant: boolean;
  data: { country: string; source?: string; fetched_at?: string };
}

export function TrendsContent({
  topics,
  startIndex,
  country,
  viewMode,
  page,
  totalPages,
  onPageChange,
  isMostRelevant,
  filterByMostRelevant,
  data,
}: TrendsContentProps) {
  const total = topics.length;

  return (
    <div className="space-y-6">
      <p className="text-[14px] text-stone-500 dark:text-stone-400">
        {total} trending topic
        {total !== 1 ? "s" : ""} in {data.country}
        {data.source === "fallback" && (
          <span
            className={
              "ml-2 rounded-lg bg-amber-100 px-2 py-0.5 text-[13px] " +
              "text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            }
          >
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
          {topics.map((topic, j) => (
            <TopicListItem
              key={`${topic.title}-${startIndex + j}`}
              topic={topic}
              index={startIndex + j + 1}
              country={country}
              isMostRelevant={isMostRelevant(topic)}
            />
          ))}
        </ul>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, j) => (
            <TopicCard
              key={`${topic.title}-${startIndex + j}`}
              topic={topic}
              index={startIndex + j + 1}
              country={country}
              isMostRelevant={isMostRelevant(topic)}
            />
          ))}
        </div>
      )}

      {total === 0 ? (
        <p
          className={
            "mx-auto max-w-2xl rounded-2xl bg-white px-6 py-10 " +
            "text-center text-[15px] text-stone-500 dark:bg-stone-900 " +
            "dark:text-stone-400"
          }
        >
          {filterByMostRelevant
            ? "No topics trending 3+ days. Try turning off the filter."
            : "No trending topics available for this country right now."}
        </p>
      ) : totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(Math.min(totalPages, page + 1))}
          className={viewMode === "list" ? "mx-auto max-w-2xl" : ""}
        />
      ) : null}
    </div>
  );
}
