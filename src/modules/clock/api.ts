import { apiFetch } from '../../api/client';
import type { SummaryResponse, EventsResponse } from '../../types';

export async function fetchSummary(params: { from: string; to: string }): Promise<SummaryResponse> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<SummaryResponse>(`/dashboard/clock/summary?${qs}`);
}

export interface FetchEventsParams {
  from: string;
  to: string;
  discordUserId?: string;
  limit?: number;
  offset?: number;
}

export async function fetchEvents(params: FetchEventsParams): Promise<EventsResponse> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  if (params.discordUserId) qs.set('discordUserId', params.discordUserId);
  qs.set('limit', String(params.limit ?? 100));
  qs.set('offset', String(params.offset ?? 0));
  return apiFetch<EventsResponse>(`/dashboard/clock/events?${qs}`);
}
