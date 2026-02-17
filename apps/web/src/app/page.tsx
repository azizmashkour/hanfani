import Link from "next/link";

export default function Home() {
  return (
    <div
      className={
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden " +
        "bg-stone-50 font-sans dark:bg-stone-950"
      }
    >
      <main
        className={
          "flex flex-1 flex-col items-center justify-center gap-10 " +
          "overflow-hidden px-8 sm:px-16"
        }
      >
        <div
          className={
            "flex flex-col items-center gap-6 text-center " +
            "sm:items-start sm:text-left"
          }
        >
          <h1
            className={
              "max-w-3xl text-4xl font-semibold leading-tight tracking-tight " +
              "text-stone-900 dark:text-stone-50 sm:text-5xl md:text-6xl"
            }
          >
            Bridging Google Trends and Social Intelligence
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-stone-600 dark:text-stone-400">
            Discover what&apos;s trending, explore coverage across news and platforms,
            and stay ahead with autonomous AI agents.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/trends"
            className={
              "flex h-12 items-center justify-center rounded-xl bg-stone-900 " +
              "px-8 text-[15px] font-medium text-white transition-colors " +
              "hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 " +
              "dark:hover:bg-stone-200"
            }
          >
            Explore Trends
          </Link>
          <Link
            href="/docs"
            className={
              "flex h-12 items-center justify-center rounded-xl border " +
              "border-stone-200 bg-white px-8 text-[15px] font-medium " +
              "text-stone-700 transition-colors hover:bg-stone-50 " +
              "dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 " +
              "dark:hover:bg-stone-800"
            }
          >
            Documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
