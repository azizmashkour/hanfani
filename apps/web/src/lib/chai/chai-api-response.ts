/**
 * Reads `status_message` from CHAI / proxy JSON bodies when present.
 */
export function getChaiApiStatusMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const sm = (data as Record<string, unknown>).status_message;
  if (typeof sm !== "string") return undefined;
  const t = sm.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Prefer API `status_message`, then `error` string, then fallback.
 */
export function getChaiApiErrorDisplayMessage(
  data: unknown,
  resStatusText: string
): string {
  const statusMsg = getChaiApiStatusMessage(data);
  if (statusMsg) return statusMsg;
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    const e = (data as { error: string }).error.trim();
    if (e) return e;
  }
  return resStatusText || "Request failed";
}
