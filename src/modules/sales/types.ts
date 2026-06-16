export type BillingPeriod = 'once' | 'month' | 'year';
export type SignatureStatus = 'IMM' | 'UW' | 'DATE';

export interface SalesCatalogProduct {
  id: number;
  code: string;
  name: string;
}

export interface SalesCatalogCompany {
  id: number;
  code: string;
  name: string;
  products: SalesCatalogProduct[];
}

export interface SalesCatalogResponse {
  companies: SalesCatalogCompany[];
  followupCodes: { code: string; label: string }[];
}

export interface Sale {
  id: number;
  agentDiscordUserId: string;
  agentDisplayName: string;
  companyCode: string;
  companyName: string;
  productCode: string;
  productName: string;
  clientName: string;
  amountCents: number;
  currency: string;
  billingPeriod: BillingPeriod;
  signatureStatus: SignatureStatus;
  signatureDate: string | null;
  followupCode: string | null;
  soldAt: string;
  notes: string | null;
}

export interface SalesAgentRanking {
  agentDiscordUserId: string;
  agentDisplayName: string;
  salesCount: number;
  totalAmountCents: number;
}

export interface SalesSummaryResponse {
  range: { from: string; to: string };
  totals: {
    salesCount: number;
    totalAmountCents: number;
    averageTicketCents: number;
    activeAgents: number;
  };
  rankings: {
    byClosings: SalesAgentRanking[];
    byAmount: SalesAgentRanking[];
  };
  byCompany: unknown[];
  byProduct: unknown[];
}

export interface SalesListResponse {
  sales: Sale[];
  total: number;
  limit: number;
  offset: number;
}

export interface SalesQueryParams {
  from: string;
  to: string;
  company?: string;
  product?: string;
  agentDiscordUserId?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateSalePayload {
  companyCode?: string;
  productCode?: string;
  clientName?: string;
  amount?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  signatureInput?: string;
  soldAt?: string;
  notes?: string | null;
}
