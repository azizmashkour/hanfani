"use client";

import { type ViewMode } from "@/components/ViewModeToggle";
import { Pagination } from "@/components/Pagination";
import { MentionListItem } from "./MentionListItem";
import { MentionCard } from "./MentionCard";
import type { MentionItem } from "@/dal/trends";

export interface MentionsContentProps {
  mentions: MentionItem[];
  viewMode: ViewMode;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function MentionsContent({
  mentions,
  viewMode,
  page,
  totalPages,
  onPageChange,
}: MentionsContentProps) {
  const total = mentions.length;

  return (
    <div className="space-y-6">
      <p className="text-[14px] text-stone-500 dark:text-stone-400">
        {total} article
        {total !== 1 ? "s" : ""} and platform
        {total !== 1 ? "s" : ""} found
      </p>

      {viewMode === "list" ? (
        <ul className="space-y-4">
          {mentions.map((m) => (
            <MentionListItem key={m.link} mention={m} />
          ))}
        </ul>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentions.map((m) => (
            <MentionCard key={m.link} mention={m} />
          ))}
        </div>
      )}

      {total === 0 ? (
        <p
          className={
            "rounded-2xl bg-white px-8 py-12 text-center text-[15px] " +
            "text-stone-500 dark:bg-stone-900 dark:text-stone-400"
          }
        >
          No articles found for this topic. Try a different country or check
          that SERPAPI_KEY is set.
        </p>
      ) : totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(Math.min(totalPages, page + 1))}
        />
      ) : null}
    </div>
  );
}
