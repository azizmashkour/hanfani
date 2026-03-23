"use client";

export interface MostRelevantBadgeProps {
  /** Number of days this topic has been trending */
  daysOngoing: number;
  /** Variant: compact for card view, default for list view */
  variant?: "default" | "compact";
}

/**
 * Badge + spinner for topics trending 3+ days.
 * Includes tooltip with days count.
 */
export function MostRelevantBadge({
  daysOngoing,
  variant = "default",
}: MostRelevantBadgeProps) {
  const tooltipText = `Trending for ${daysOngoing} day${daysOngoing === 1 ? "" : "s"}`;

  const isCompact = variant === "compact";

  return (
    <span
      title={tooltipText}
      className={
        isCompact
          ? "inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 " +
            "py-0.5 text-[10px] font-semibold text-emerald-700 " +
            "dark:bg-emerald-900/50 dark:text-emerald-300"
          : "inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 " +
            "py-0.5 text-[11px] font-semibold uppercase tracking-wide " +
            "text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
      }
    >
      <span
        className={
          isCompact
            ? "h-1 w-1 animate-spin rounded-full border border-emerald-500 " +
              "border-t-transparent"
            : "h-1.5 w-1.5 animate-spin rounded-full border-2 " +
              "border-emerald-500 border-t-transparent"
        }
        aria-hidden
      />
      Most relevant
    </span>
  );
}
