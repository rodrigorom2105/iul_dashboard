import { useQuery } from '@tanstack/react-query';
import { fetchSummary, fetchEvents, type FetchEventsParams } from './api';
import { getRangePreset } from '../../utils/time';

export function useSummary(from: string, to: string, liveEnd?: boolean) {
  return useQuery({
    queryKey: ['summary', from, liveEnd ? 'live' : to],
    queryFn: () => fetchSummary({ from, to: liveEnd ? new Date().toISOString() : to }),
    refetchInterval: 30_000,
    staleTime: 25_000,
    enabled: Boolean(from && to),
  });
}

export function useLiveAgents() {
  return useQuery({
    queryKey: ['summary', 'live'],
    queryFn: () => {
      const { from, to } = getRangePreset('today');
      return fetchSummary({ from, to });
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    select: (data) => data.agents,
  });
}

export function useEvents(params: FetchEventsParams, liveEnd?: boolean) {
  return useQuery({
    queryKey: ['events', params.from, liveEnd ? 'live' : params.to, params.discordUserId, params.limit, params.offset],
    queryFn: () => fetchEvents({ ...params, to: liveEnd ? new Date().toISOString() : params.to }),
    refetchInterval: 60_000,
    staleTime: 55_000,
    enabled: Boolean(params.from && params.to),
  });
}
