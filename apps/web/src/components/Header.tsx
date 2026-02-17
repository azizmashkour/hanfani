import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className={
        "sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 " +
        "py-5 backdrop-blur-sm dark:border-stone-700/50 dark:bg-stone-950/95"
      }
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8">
        <Link
          href="/"
          className={
            "inline-flex items-baseline font-semibold tracking-tight " +
            "text-stone-900 dark:text-stone-50"
          }
        >
          <span className="text-xl">Hanfani</span>
          <span className="ml-0.5 text-sm text-stone-500 dark:text-stone-400">.AI</span>
        </Link>
        <nav className="flex items-center gap-10">
          <Link
            href="/trends"
            className={
              "text-[15px] text-stone-600 transition-colors " +
              "hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            }
          >
            Trends
          </Link>
          <Link
            href="/agent"
            className={
              "text-[15px] text-stone-600 transition-colors " +
              "hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            }
          >
            Agent
          </Link>
          <Link
            href="/docs"
            className={
              "text-[15px] text-stone-600 transition-colors " +
              "hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            }
          >
            Docs
          </Link>
          <Link
            href="/status"
            className={
              "text-[15px] text-stone-600 transition-colors " +
              "hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
            }
          >
            Status
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
