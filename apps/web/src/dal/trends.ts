/**
 * Data Access Layer - Trends API
 */

import { http } from "@/http/client";

export interface TrendItem {
  title: string;
  search_volume?: string;
  started?: string;
  /** Number of days this topic has been trending (3+ = most relevant badge) */
  days_ongoing?: number;
}

export interface TrendsResponse {
  country: string;
  topics: TrendItem[] | string[];
  source?: "api" | "fallback" | "db" | "scraper" | "serpapi";
  fetched_at?: string;
}

export interface MentionItem {
  title: string;
  source: string;
  source_type?: string;
  link: string;
  snippet?: string;
  date?: string;
  iso_date?: string;
  authors?: string[];
  thumbnail?: string;
  position?: number;
}

export interface MentionsResponse {
  topic: string;
  country: string;
  mentions: MentionItem[];
}

export type TrendsFilter = "yesterday" | "last_7_days";

export async function getTrends(
  country: string,
  filterParam: TrendsFilter = "last_7_days"
): Promise<TrendsResponse> {
  const params = new URLSearchParams({
    country,
    filter_param: filterParam,
  });
  return http.get<TrendsResponse>(`/trends?${params}`, 10000);
}

export async function getMentions(
  topic: string,
  country: string
): Promise<MentionsResponse> {
  const params = new URLSearchParams({
    topic,
    country,
  });
  return http.get<MentionsResponse>(`/trends/mentions?${params}`, 15000);
}
