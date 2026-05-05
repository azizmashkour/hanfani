import type {
  ChaiModelCardPayload,
  ChaiPublicUser,
} from "@/lib/chai/constants";
import { getChaiApiErrorDisplayMessage } from "@/lib/chai/chai-api-response";

export type ChaiSubmitResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string; data?: unknown };

export async function submitPublicModelCard(input: {
  user: ChaiPublicUser;
  organization: { name: string; slug: string };
  model_card: ChaiModelCardPayload;
}): Promise<ChaiSubmitResult> {
  const res = await fetch("/api/chai/public-model-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: input.user,
      organization: input.organization,
      model_card: input.model_card,
    }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = getChaiApiErrorDisplayMessage(data, res.statusText);
    return { ok: false, status: res.status, error: errMsg, data };
  }

  return { ok: true, status: res.status, data };
}

/** Raw body for test scenarios (custom shapes, missing keys, etc.). */
export async function submitChaiRegistryRequest(
  body: Record<string, unknown>
): Promise<ChaiSubmitResult> {
  const res = await fetch("/api/chai/public-model-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg = getChaiApiErrorDisplayMessage(data, res.statusText);
    return { ok: false, status: res.status, error: errMsg, data };
  }

  return { ok: true, status: res.status, data };
}
