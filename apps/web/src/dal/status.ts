/**
 * Data Access Layer - Status API
 */

import { http } from "@/http/client";

export interface StatusResponse {
  status: string;
  service?: string;
  version?: string;
  timestamp?: string;
}

export async function getStatus(): Promise<StatusResponse> {
  return http.get<StatusResponse>("/status", 5000);
}
