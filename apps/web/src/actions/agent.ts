/**
 * Actions - Agent
 * Public API for components. No fetch in components.
 */

import { sendAgentMessage as dalSendAgentMessage } from "@/dal/agent";

export async function sendAgentMessage(
  message: string,
  country: string,
  topic?: string
): Promise<string> {
  const res = await dalSendAgentMessage(message, country, topic);
  return res.reply ?? "No response.";
}
