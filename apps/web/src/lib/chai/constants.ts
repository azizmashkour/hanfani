/**
 * Organization sent to CHAI Public Model Cards API for this integration.
 * Registry credentials come from CHAI_REGISTRY_* env vars (server-side only).
 */
export const CHAI_ORBDOC_ORGANIZATION = {
  name: "orbdoc",
  slug: "orbdoc",
} as const;

export const CHAI_COALITION_ORGANIZATION = {
  name: "Coalition For Health Ai",
  slug: "coalition-for-health-ai",
} as const;

export const CHAI_AIDOC_ORGANIZATION = {
  name: "aidoc",
  slug: "aidoc",
} as const;

/** Submit modes: orbdoc.com vs aidoc.com org payloads */
export type ChaiOrgMode = "orbdoc" | "aidoc";

export const CHAI_ORG_BY_MODE: Record<
  ChaiOrgMode,
  { name: string; slug: string; domain: string }
> = {
  orbdoc: {
    name: CHAI_ORBDOC_ORGANIZATION.name,
    slug: CHAI_ORBDOC_ORGANIZATION.slug,
    domain: "orbdoc.com",
  },
  aidoc: {
    name: CHAI_AIDOC_ORGANIZATION.name,
    slug: CHAI_AIDOC_ORGANIZATION.slug,
    domain: "aidoc.com",
  },
};

/** Server allows only these organization objects on the public proxy. */
export const CHAI_ALLOWED_ORGANIZATIONS: readonly { name: string; slug: string }[] =
  [CHAI_ORBDOC_ORGANIZATION, CHAI_AIDOC_ORGANIZATION];

export type ChaiPublicUser = {
  email: string;
  full_name: string;
  role: string;
};

export type ChaiModelCardPayload = Record<string, unknown>;
