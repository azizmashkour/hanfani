"use client";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

const btnClass =
  "rounded-lg border border-stone-200 bg-white px-3 py-1.5 " +
  "text-[13px] font-medium text-stone-700 transition " +
  "disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 " +
  "dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 " +
  "dark:hover:bg-stone-800";

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  className = "",
}: PaginationProps) {
  return (
    <nav
      className={
        "flex items-center justify-between border-t border-stone-200 " +
        `pt-6 dark:border-stone-700 ${className}`.trim()
      }
    >
      <p className="text-[13px] text-stone-500 dark:text-stone-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          className={btnClass}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className={btnClass}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
