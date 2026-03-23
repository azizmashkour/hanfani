"use client";

import Link from "next/link";
import { MostRelevantBadge } from "@/components/MostRelevantBadge";
import type { TrendItem } from "@/actions/trends";

export interface TopicCardProps {
  topic: TrendItem;
  index: number;
  country: string;
  isMostRelevant: boolean;
}

export function TopicCard({
  topic,
  index,
  country,
  isMostRelevant,
}: TopicCardProps) {
  const detailsUrl =
    `/trends/details?topic=${encodeURIComponent(topic.title)}&country=${country}`;

  return (
    <Link
      href={detailsUrl}
      className={
        "group relative flex flex-col overflow-hidden rounded-xl border " +
        "bg-white transition " +
        (isMostRelevant
          ? "border-emerald-300/60 dark:border-emerald-700/50 " +
            "hover:border-emerald-400 " +
            "hover:shadow-[0_4px_12px_rgba(16,185,129,0.15)] " +
            "dark:border-stone-700/80 dark:bg-stone-900 " +
            "dark:hover:border-emerald-600"
          : "border-stone-200 hover:border-stone-300 " +
            "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] " +
            "dark:border-stone-700/80 dark:bg-stone-900 " +
            "dark:hover:border-stone-600 " +
            "dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]")
      }
    >
      <div
        className={
          "absolute left-0 top-0 h-full w-1 transition " +
          (isMostRelevant
            ? "bg-emerald-400 group-hover:bg-emerald-500 " +
              "dark:bg-emerald-600 dark:group-hover:bg-emerald-500"
            : "bg-stone-200 group-hover:bg-stone-400 " +
              "dark:bg-stone-600 dark:group-hover:bg-stone-500")
        }
      />
      <div className="flex flex-1 flex-col p-4 pl-5">
        <span
          className={
            "mb-1 flex items-center gap-2 text-[11px] " +
            "font-medium uppercase tracking-wider " +
            "text-stone-400 dark:text-stone-500"
          }
        >
          #{index}
          {isMostRelevant && topic.days_ongoing != null && (
            <MostRelevantBadge
              daysOngoing={topic.days_ongoing}
              variant="compact"
            />
          )}
        </span>
        <span
          className={
            "font-medium text-stone-900 dark:text-stone-50 " +
            "group-hover:text-stone-700 dark:group-hover:text-stone-200"
          }
        >
          {topic.title}
        </span>
        {(topic.search_volume || topic.started) && (
          <span className="mt-2 text-[13px] text-stone-500 dark:text-stone-400">
            {[topic.search_volume, topic.started].filter(Boolean).join(" · ")}
          </span>
        )}
        <span
          className={
            "mt-3 text-[13px] font-medium text-stone-500 " +
            "dark:text-stone-400 group-hover:text-stone-700 " +
            "dark:group-hover:text-stone-300"
          }
        >
          View coverage →
        </span>
      </div>
    </Link>
  );
}
