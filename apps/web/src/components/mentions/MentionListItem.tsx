"use client";

import type { MentionItem } from "@/dal/trends";

export interface MentionListItemProps {
  mention: MentionItem;
}

export function MentionListItem({ mention }: MentionListItemProps) {
  return (
    <li
      className={
        "group relative overflow-hidden rounded-xl border border-stone-200 " +
        "bg-white transition hover:border-stone-300 " +
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
      <a
        href={mention.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 pl-6"
      >
        <div className="flex gap-5">
          {mention.thumbnail && (
            <img
              src={mention.thumbnail}
              alt=""
              className="h-24 w-32 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2
              className={
                "font-medium text-stone-900 dark:text-stone-50 hover:underline"
              }
            >
              {mention.title}
            </h2>
            <div
              className={
                "mt-1.5 flex flex-wrap items-center gap-2 " +
                "text-[13px] text-stone-500 dark:text-stone-400"
              }
            >
              <span className="font-medium">{mention.source}</span>
              {mention.date && <span>· {mention.date}</span>}
              {mention.authors && mention.authors.length > 0 && (
                <span>· {mention.authors.slice(0, 2).join(", ")}</span>
              )}
            </div>
            {mention.snippet && (
              <p
                className={
                  "mt-2 line-clamp-2 text-[14px] leading-relaxed " +
                  "text-stone-600 dark:text-stone-400"
                }
              >
                {mention.snippet}
              </p>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}
