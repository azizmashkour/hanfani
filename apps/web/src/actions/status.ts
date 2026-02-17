/**
 * Actions - Status
 * Public API for components. No fetch in components.
 */

import { getStatus as dalGetStatus } from "@/dal/status";

export interface StatusCheckResult {
  status: "operational" | "degraded" | "outage";
  message?: string;
}

export async function checkApiStatus(): Promise<StatusCheckResult> {
  try {
    const data = await dalGetStatus();
    return {
      status: data?.status === "operational" ? "operational" : "degraded",
      message: data?.status,
    };
  } catch (err) {
    return {
      status: "outage",
      message: err instanceof Error ? err.message : "Unreachable",
    };
  }
}
