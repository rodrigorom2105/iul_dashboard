import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSale, fetchSalesCatalog, fetchSalesList, fetchSalesSummary, updateSale } from './api';
import type { SalesQueryParams, UpdateSalePayload } from './types';

export function useSalesCatalog() {
  return useQuery({ queryKey: ['salesCatalog'], queryFn: fetchSalesCatalog, staleTime: 5 * 60_000 });
}

export function useSalesSummary(params: SalesQueryParams, liveEnd?: boolean) {
  return useQuery({
    queryKey: ['salesSummary', params.from, liveEnd ? 'live' : params.to, params.company, params.product, params.agentDiscordUserId],
    queryFn: () => fetchSalesSummary({ ...params, to: liveEnd ? new Date().toISOString() : params.to }),
    enabled: Boolean(params.from && params.to),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

export function useSalesList(params: SalesQueryParams, liveEnd?: boolean) {
  return useQuery({
    queryKey: ['salesList', params.from, liveEnd ? 'live' : params.to, params.company, params.product, params.agentDiscordUserId, params.limit, params.offset],
    queryFn: () => fetchSalesList({ ...params, to: liveEnd ? new Date().toISOString() : params.to }),
    enabled: Boolean(params.from && params.to),
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSalePayload }) => updateSale(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['salesSummary'] });
      await qc.invalidateQueries({ queryKey: ['salesList'] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['salesSummary'] });
      await qc.invalidateQueries({ queryKey: ['salesList'] });
    },
  });
}
