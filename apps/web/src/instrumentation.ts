/**
 * Runs once when the Next.js Node server starts (not per request).
 * Helps verify .env / .env.local are loaded (e.g. CHAI_REGISTRY_*, CHAI_PUBLIC_API_BASE_URL).
 *
 * Set HANFANI_LOG_ENV_FULL=1 to print full values including secrets (avoid in shared logs).
 */

export async function register() {
  // Edge middleware/build paths skip heavy logging; dev server is Node.
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const keys = Object.keys(process.env).sort();
  const full = process.env.HANFANI_LOG_ENV_FULL === "1";

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(
    `[hanfani/web] Server startup — ${keys.length} process.env keys ` +
      `(HANFANI_LOG_ENV_FULL=${full ? "1" : "0"})`
  );
  console.log("══════════════════════════════════════════════════════════════");

  for (const key of keys) {
    const raw = process.env[key];
    console.log(`  ${key}=${formatEnvLine(key, raw, full)}`);
  }

  console.log("══════════════════════════════════════════════════════════════\n");
}

function formatEnvLine(
  key: string,
  value: string | undefined,
  full: boolean
): string {
  if (value === undefined) {
    return "(undefined — not set in process.env)";
  }
  if (value === "") {
    return "(empty string)";
  }

  if (!full && isLikelySecretKey(key)) {
    return `[${value.length} characters — hidden; use HANFANI_LOG_ENV_FULL=1 to print]`;
  }

  if (value.length > 500) {
    return `${value.slice(0, 500)}… [truncated, total ${value.length} chars]`;
  }

  return value;
}

function isLikelySecretKey(key: string): boolean {
  return /SECRET|PASSWORD|TOKEN|CREDS|API_KEY|PRIVATE|AUTH|COOKIE|SESSION|BEARER/i.test(
    key
  );
}
