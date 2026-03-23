"use client";

import type { MentionItem } from "@/dal/trends";

export interface MentionCardProps {
  mention: MentionItem;
}

export function MentionCard({ mention }: MentionCardProps) {
  return (
    <a
      href={mention.link}
      target="_blank"
      rel="noopener noreferrer"
      className={
        "group relative flex flex-col overflow-hidden rounded-xl border " +
        "border-stone-200 bg-white transition hover:border-stone-300 " +
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] " +
        "dark:border-stone-700/80 dark:bg-stone-900 " +
        "dark:hover:border-stone-600 dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
      }
    >
      <div
        className={
          "absolute left-0 top-0 h-full w-1 bg-stone-200 " +
          "transition group-hover:bg-stone-400 dark:bg-stone-600 " +
          "dark:group-hover:bg-stone-500"
        }
      />
      <div className="flex flex-1 flex-col p-4 pl-5">
        {mention.thumbnail && (
          <img
            src={mention.thumbnail}
            alt=""
            className="mb-3 h-32 w-full rounded-lg object-cover"
          />
        )}
        <span
          className={
            "mb-1 text-[11px] font-medium uppercase tracking-wider " +
            "text-stone-400 dark:text-stone-500"
          }
        >
          {mention.source}
        </span>
        <span
          className={
            "font-medium text-stone-900 dark:text-stone-50 line-clamp-2 " +
            "group-hover:text-stone-700 dark:group-hover:text-stone-200"
          }
        >
          {mention.title}
        </span>
        {mention.date && (
          <span className="mt-2 text-[13px] text-stone-500 dark:text-stone-400">
            {mention.date}
          </span>
        )}
        {mention.snippet && (
          <p
            className={
              "mt-2 line-clamp-2 text-[13px] text-stone-500 " +
              "dark:text-stone-400"
            }
          >
            {mention.snippet}
          </p>
        )}
      </div>
    </a>
  );
}
