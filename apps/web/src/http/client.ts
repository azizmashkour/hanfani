/**
 * HTTP client for API requests.
 * All fetch calls are centralized here.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface HttpError extends Error {
  status?: number;
  detail?: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout = 15000, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error((data.detail as string) || `HTTP ${res.status}`) as HttpError;
      err.status = res.status;
      err.detail = data.detail;
      throw err;
    }

    return data as T;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export const http = {
  get<T>(path: string, timeout = 15000): Promise<T> {
    return request<T>(path, { method: "GET", timeout });
  },

  post<T>(path: string, body: unknown, timeout = 60000): Promise<T> {
    return request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout,
    });
  },
};
