import { NextResponse } from "next/server";
import { CHAI_ALLOWED_ORGANIZATIONS } from "@/lib/chai/constants";
import { getChaiRegistryCredentialsFromEnv } from "@/lib/chai/registry-credentials";

function allowedOrganizationsErrorBody(): { error: string } {
  const pairs = CHAI_ALLOWED_ORGANIZATIONS.map(
    (o) => `${o.name}/${o.slug}`
  ).join(", ");
  return {
    error: `Invalid organization: allowed name/slug pairs are ${pairs}`,
  };
}

function isAllowedOrganization(
  org: unknown
): org is { name: string; slug: string } {
  if (typeof org !== "object" || org === null) return false;
  const o = org as { name?: unknown; slug?: unknown };
  if (typeof o.name !== "string" || typeof o.slug !== "string") return false;
  return CHAI_ALLOWED_ORGANIZATIONS.some(
    (a) => a.name === o.name && a.slug === o.slug
  );
}

/**
 * Proxies POST /api/v1/model-cards to the CHAI registry.
 * Auth from CHAI_REGISTRY_PUBLIC_KEY + CHAI_REGISTRY_SECRET_KEY (or CHAI_API_* aliases).
 * Optional CHAI_REGISTRY_ORG_SLUG → Chai-Registry-Org-Slug on upstream fetch.
 */
export async function POST(request: Request) {
  const base =
    process.env.CHAI_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8000";

  const creds = getChaiRegistryCredentialsFromEnv();
  if (!creds.ok) {
    return NextResponse.json({ error: creds.error }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("user" in body) ||
    !("model_card" in body) ||
    !("organization" in body)
  ) {
    return NextResponse.json(
      { error: "Expected JSON with user, organization, and model_card" },
      { status: 400 }
    );
  }

  const { user, organization, model_card } = body as {
    user: unknown;
    organization: unknown;
    model_card: unknown;
  };

  if (!isAllowedOrganization(organization)) {
    return NextResponse.json(allowedOrganizationsErrorBody(), { status: 400 });
  }

  const payload = {
    user,
    organization,
    model_card,
  };

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Chai-Registry-Public-Key": creds.publicKey,
    "Chai-Registry-Secret-Key": creds.secretKey,
  };
  if (creds.orgSlug) {
    upstreamHeaders["Chai-Registry-Org-Slug"] = creds.orgSlug;
  }

  const upstream = await fetch(`${base}/api/v1/model-cards`, {
    method: "POST",
    headers: upstreamHeaders,
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text || upstream.statusText };
  }

  return NextResponse.json(json, { status: upstream.status });
}
