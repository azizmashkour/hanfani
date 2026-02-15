export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString().split("T")[0];

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-6 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row">
        <span>Hanfani AI v{version}</span>
        <span>Built {buildDate}</span>
      </div>
    </footer>
  );
}
