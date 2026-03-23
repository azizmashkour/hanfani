"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ES", name: "Spain" },
  { code: "CR", name: "Costa Rica" },
] as const;

interface SearchableCountrySelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export default function SearchableCountrySelect({
  id,
  label,
  value,
  onChange,
  className = "",
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);
  const displayValue = selected ? `${selected.name} (${selected.code})` : value;

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setSearch("");
      setIsOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputBase =
    "w-full max-w-xs rounded-lg border border-stone-200 bg-white px-4 py-2.5 " +
    "text-[14px] text-stone-900 transition focus:outline-none focus:ring-2 " +
    "focus:ring-stone-200/50 dark:border-stone-700 dark:bg-stone-900 " +
    "dark:text-stone-50 dark:focus:ring-stone-600/30";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-medium text-stone-700 dark:text-stone-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={isOpen ? search : displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setSearch("");
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearch("");
              setIsOpen(false);
            }
            if (e.key === "Enter" && filtered.length === 1) {
              handleSelect(filtered[0].code);
            }
          }}
          placeholder="Search country..."
          className={`${inputBase} focus:border-stone-400 dark:focus:border-stone-600`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle dropdown"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
        >
          <svg
            className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul
          className={
            "absolute z-50 mt-1 max-h-60 w-full max-w-xs overflow-auto " +
            "rounded-lg border border-stone-200 bg-white py-1 shadow-lg " +
            "dark:border-stone-700 dark:bg-stone-900 dark:shadow-stone-950/50"
          }
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-[14px] text-stone-500 dark:text-stone-400">
              No country found
            </li>
          ) : (
            filtered.map((c) => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                onClick={() => handleSelect(c.code)}
                className={
                  "cursor-pointer px-4 py-2.5 text-[14px] transition " +
                  (c.code === value
                    ? "bg-stone-100 font-medium text-stone-900 dark:bg-stone-800 dark:text-stone-50"
                    : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 " +
                      "dark:hover:bg-stone-800")
                }
              >
                {c.name} ({c.code})
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
