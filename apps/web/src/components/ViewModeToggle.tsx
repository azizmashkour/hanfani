"use client";

export type ViewMode = "list" | "cards";

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const base =
    "cursor-pointer inline-flex items-center justify-center rounded-md p-2 " +
    "transition ";
  const active =
    "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-50";
  const inactive =
    "text-stone-500 hover:bg-stone-50 hover:text-stone-700 " +
    "dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-300";

  return (
    <div
      className={
        "flex items-center gap-1 rounded-lg border border-stone-200 " +
        "bg-white p-1 dark:border-stone-700 dark:bg-stone-900"
      }
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="List view"
        title="List view"
        className={base + (value === "list" ? active : inactive)}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        aria-label="Card view"
        title="Card view"
        className={base + (value === "cards" ? active : inactive)}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" +
              "M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" +
              "M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" +
              "M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            }
          />
        </svg>
      </button>
    </div>
  );
}
