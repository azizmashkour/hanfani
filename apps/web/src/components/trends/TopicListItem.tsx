"use client";

import Link from "next/link";
import { MostRelevantBadge } from "@/components/MostRelevantBadge";
import type { TrendItem } from "@/actions/trends";

export interface TopicListItemProps {
  topic: TrendItem;
  index: number;
  country: string;
  isMostRelevant: boolean;
}

export function TopicListItem({
  topic,
  index,
  country,
  isMostRelevant,
}: TopicListItemProps) {
  const detailsUrl =
    `/trends/details?topic=${encodeURIComponent(topic.title)}&country=${country}`;

  return (
    <li
      className={
        "rounded-2xl bg-white shadow-sm transition hover:shadow-md " +
        "dark:bg-stone-900 dark:shadow-stone-950/50 dark:hover:shadow-stone-900/50"
      }
    >
      <Link href={detailsUrl} className="flex items-center gap-4 px-5 py-4">
        <span
          className={
            "relative flex h-8 w-8 shrink-0 items-center justify-center " +
            "rounded-xl text-[14px] font-medium " +
            (isMostRelevant
              ? "bg-emerald-100 text-emerald-700 " +
                "dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400")
          }
        >
          {isMostRelevant && (
            <span
              className={
                "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 " +
                "animate-ping rounded-full bg-emerald-500 opacity-75"
              }
              aria-hidden
            />
          )}
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={
              "flex items-center gap-2 font-medium " +
              "text-stone-900 dark:text-stone-50"
            }
          >
            {topic.title}
            {isMostRelevant && topic.days_ongoing != null && (
              <MostRelevantBadge
                daysOngoing={topic.days_ongoing}
                variant="default"
              />
            )}
          </span>
          {(topic.search_volume || topic.started) && (
            <span
              className={
                "mt-0.5 block text-[13px] text-stone-500 dark:text-stone-400"
              }
            >
              {[topic.search_volume, topic.started].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        <span
          className={
            "shrink-0 text-[13px] text-stone-400 dark:text-stone-500"
          }
        >
          View coverage →
        </span>
      </Link>
    </li>
  );
}
