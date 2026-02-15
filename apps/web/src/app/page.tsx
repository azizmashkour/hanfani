import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100 font-sans dark:bg-zinc-950">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-8 bg-zinc-50 dark:bg-zinc-950 sm:items-start sm:px-16">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-6xl md:text-7xl lg:text-8xl">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-base leading-6 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new/clone?repository-url=https://github.com/azizmashkour/hanfani"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="/docs"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
