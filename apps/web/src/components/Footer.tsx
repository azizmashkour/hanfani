export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const buildDate =
    process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString().split("T")[0];

  return (
    <footer
      className={
        "mt-auto border-t border-stone-200/80 bg-white/80 py-6 " +
        "dark:border-stone-700/50 dark:bg-stone-950/80"
      }
    >
      <div
        className={
          "mx-auto flex max-w-5xl flex-col items-center justify-between " +
          "gap-2 px-8 text-[13px] text-stone-500 dark:text-stone-400 sm:flex-row"
        }
      >
        <span>Hanfani AI v{version}</span>
        <span>Built {buildDate}</span>
      </div>
    </footer>
  );
}
