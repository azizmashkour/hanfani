/**
 * CHAI registry auth from individual env vars (no JSON array).
 * Server-only — never expose these with NEXT_PUBLIC_*.
 */

export type ChaiRegistryCredentials =
  | {
      ok: true;
      publicKey: string;
      secretKey: string;
      /** Sent as `Chai-Registry-Org-Slug` when set (CHAI_REGISTRY_ORG_SLUG). */
      orgSlug?: string;
    }
  | { ok: false; error: string };

/**
 * Reads public + secret keys for Chai-Registry-* headers.
 * Primary: CHAI_REGISTRY_PUBLIC_KEY, CHAI_REGISTRY_SECRET_KEY
 * Aliases: CHAI_API_KEY, CHAI_API_SECRET
 * Optional: CHAI_REGISTRY_ORG_SLUG → Chai-Registry-Org-Slug header on upstream requests
 */
export function getChaiRegistryCredentialsFromEnv(): ChaiRegistryCredentials {
  const publicKey = pickFirstNonEmpty(
    process.env.CHAI_REGISTRY_PUBLIC_KEY,
    process.env.CHAI_API_KEY
  );
  const secretKey = pickFirstNonEmpty(
    process.env.CHAI_REGISTRY_SECRET_KEY,
    process.env.CHAI_API_SECRET
  );
  const orgSlug = pickFirstNonEmpty(process.env.CHAI_REGISTRY_ORG_SLUG);

  if (!publicKey || !secretKey) {
    const missing: string[] = [];
    if (!publicKey) {
      missing.push("CHAI_REGISTRY_PUBLIC_KEY (or CHAI_API_KEY)");
    }
    if (!secretKey) {
      missing.push("CHAI_REGISTRY_SECRET_KEY (or CHAI_API_SECRET)");
    }
    return {
      ok: false,
      error: `Missing registry credentials: set ${missing.join(" and ")} in .env.local.`,
    };
  }

  return {
    ok: true,
    publicKey,
    secretKey,
    ...(orgSlug ? { orgSlug } : {}),
  };
}

function pickFirstNonEmpty(...vals: (string | undefined)[]): string | undefined {
  for (const v of vals) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}
