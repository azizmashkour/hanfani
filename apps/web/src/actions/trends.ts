/**
 * Actions - Trends
 * Public API for components. No fetch in components.
 */

import {
  getTrends as dalGetTrends,
  getMentions as dalGetMentions,
  type TrendsResponse,
  type MentionsResponse,
  type TrendsFilter,
} from "@/dal/trends";

export type {
  TrendsResponse,
  MentionsResponse,
  TrendsFilter,
  TrendItem,
} from "@/dal/trends";

export async function fetchTrends(
  country: string,
  filterParam: TrendsFilter = "last_7_days"
): Promise<TrendsResponse> {
  return dalGetTrends(country, filterParam);
}

export async function fetchMentions(
  topic: string,
  country: string
): Promise<MentionsResponse> {
  return dalGetMentions(topic, country);
}
