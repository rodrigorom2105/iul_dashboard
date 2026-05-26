import { useQuery } from '@tanstack/react-query';
import { fetchSummary, fetchEvents, type FetchEventsParams } from './api';

export function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['summary', from, to],
    queryFn: () => fetchSummary({ from, to }),
    refetchInterval: 30_000,
    staleTime: 25_000,
    enabled: Boolean(from && to),
  });
}

export function useEvents(params: FetchEventsParams) {
  return useQuery({
    queryKey: ['events', params.from, params.to, params.discordUserId, params.limit, params.offset],
    queryFn: () => fetchEvents(params),
    refetchInterval: 60_000,
    staleTime: 55_000,
    enabled: Boolean(params.from && params.to),
  });
}
