import type { NextConfig } from "next";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function getAppVersion(): string {
  const paths = [
    join(process.cwd(), "../..", "package.json"),
    join(process.cwd(), "package.json"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const pkg = JSON.parse(readFileSync(p, "utf-8"));
        return pkg.version ?? "0.1.0";
      } catch {
        continue;
      }
    }
  }
  return "0.1.0";
}

const nextConfig: NextConfig = {
  turbopack: {
    root: join(__dirname, "..", ".."),
  },
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: getAppVersion(),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split("T")[0],
  },
};

export default nextConfig;
