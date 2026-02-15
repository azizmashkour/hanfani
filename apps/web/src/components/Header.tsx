import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-50 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
        <Link
          href="/"
          className="inline-flex items-baseline font-semibold tracking-tight text-black dark:text-zinc-50"
        >
          <span className="text-xl">Hanfani</span>
          <span className="ml-0.5 text-sm">.AI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Docs
          </Link>
          <Link
            href="/status"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Status
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
