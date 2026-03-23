"use client";

import SearchableCountrySelect from "@/components/SearchableCountrySelect";
import type { TrendsFilter } from "@/actions/trends";

const FILTER_OPTIONS: { value: TrendsFilter; label: string }[] = [
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
];

export interface TrendsFiltersProps {
  country: string;
  onCountryChange: (c: string) => void;
  filter: TrendsFilter;
  onFilterChange: (f: TrendsFilter) => void;
  filterByMostRelevant: boolean;
  onFilterByMostRelevantChange: (v: boolean) => void;
  showMostRelevantToggle: boolean;
}

export function TrendsFilters({
  country,
  onCountryChange,
  filter,
  onFilterChange,
  filterByMostRelevant,
  onFilterByMostRelevantChange,
  showMostRelevantToggle,
}: TrendsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <SearchableCountrySelect
        id="country"
        label="Country"
        value={country}
        onChange={onCountryChange}
      />
      <div>
        <label
          htmlFor="filter"
          className="mb-2 block text-[13px] font-medium text-stone-700 dark:text-stone-300"
        >
          Period
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as TrendsFilter)}
          className={
            "cursor-pointer rounded-lg border border-stone-200 bg-white " +
            "px-4 py-2.5 text-[14px] text-stone-900 transition " +
            "focus:outline-none focus:ring-2 focus:ring-stone-200/50 " +
            "dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 " +
            "dark:focus:ring-stone-600/30"
          }
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {showMostRelevantToggle && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={filterByMostRelevant}
            aria-label="Filter by most relevant only"
            title={
              filterByMostRelevant
                ? "Showing only topics trending 3+ days"
                : "Show all topics"
            }
            onClick={() => onFilterByMostRelevantChange(!filterByMostRelevant)}
            className={
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer " +
              "items-center rounded-full transition-colors " +
              (filterByMostRelevant
                ? "bg-emerald-500"
                : "bg-stone-200 dark:bg-stone-700")
            }
          >
            <span
              className={
                "pointer-events-none inline-block h-5 w-5 transform " +
                "rounded-full bg-white shadow ring-0 transition " +
                (filterByMostRelevant ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
          <span className="text-[13px] font-medium text-stone-700 dark:text-stone-300">
            Most relevant only
          </span>
        </div>
      )}
    </div>
  );
}
