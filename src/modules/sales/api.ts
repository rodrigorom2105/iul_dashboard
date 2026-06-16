import { apiFetch } from '../../api/client';
import type { SalesCatalogResponse, SalesListResponse, SalesQueryParams, SalesSummaryResponse, UpdateSalePayload } from './types';

function buildSalesQs(params: SalesQueryParams): URLSearchParams {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  if (params.company) qs.set('company', params.company);
  if (params.product) qs.set('product', params.product);
  if (params.agentDiscordUserId) qs.set('agentDiscordUserId', params.agentDiscordUserId);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  return qs;
}

export async function fetchSalesCatalog(): Promise<SalesCatalogResponse> {
  return apiFetch<SalesCatalogResponse>('/dashboard/sales/catalog');
}

export async function fetchSalesSummary(params: SalesQueryParams): Promise<SalesSummaryResponse> {
  return apiFetch<SalesSummaryResponse>(`/dashboard/sales/summary?${buildSalesQs(params)}`);
}

export async function fetchSalesList(params: SalesQueryParams): Promise<SalesListResponse> {
  return apiFetch<SalesListResponse>(`/dashboard/sales?${buildSalesQs(params)}`);
}

export async function updateSale(id: number, payload: UpdateSalePayload): Promise<{ sale: unknown }> {
  return apiFetch<{ sale: unknown }>(`/dashboard/sales/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteSale(id: number): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/dashboard/sales/${id}`, { method: 'DELETE' });
}
