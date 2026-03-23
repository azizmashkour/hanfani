/**
 * Data Access Layer - Agent API
 */

import { http } from "@/http/client";

export interface AgentChatResponse {
  reply: string;
}

export async function sendAgentMessage(
  message: string,
  country: string,
  topic?: string
): Promise<AgentChatResponse> {
  return http.post<AgentChatResponse>(
    "/agent/chat",
    { message, country, topic: topic?.trim() || undefined },
    60000
  );
}
