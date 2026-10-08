/**
 * PayVia Merchant Analytics Type Definitions
 * Models transactions, KPIs, and dashboard datasets for AG Grid & AG Studio integration.
 */

export interface MerchantTransactionRecord {
  id: string;
  negotiationId: string;
  productId: string;
  productName: string;
  category: string;
  source: "channel3" | "demo";
  merchantName: string;
  originalPrice: number;
  negotiatedPrice: number;
  savings: number;
  savingsPercentage: number;
  deliveryDays: number;
  buyerMaxPrice: number;
  merchantMinPrice: number;
  negotiationStatus: "AGREED" | "FAILED" | "IN_PROGRESS";
  paymentStatus: "SETTLED" | "PENDING_APPROVAL" | "UNPAID" | "N/A";
  roundsCount: number;
  currency: string;
  createdAt: string;
  paypalOrderId?: string;
}

export interface MerchantKPIs {
  totalNegotiations: number;
  completedTransactions: number;
  totalRevenue: number;
  totalSavings: number;
  averageSavingsPct: number;
  acceptanceRate: number;
}

export interface ProductPerformanceSummary {
  productName: string;
  category: string;
  negotiationCount: number;
  agreedCount: number;
  totalRevenue: number;
  avgSavings: number;
  avgSavingsPct: number;
  acceptanceRate: number;
}

export interface OutcomeDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface MerchantAnalyticsDataset {
  kpis: MerchantKPIs;
  records: MerchantTransactionRecord[];
  byProduct: ProductPerformanceSummary[];
  outcomeDistribution: OutcomeDistribution[];
  sourceDistribution: Array<{ source: string; count: number }>;
  generatedAt: string;
}

export interface MerchantAiQueryRequest {
  query: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface MerchantAiQueryResponse {
  success: boolean;
  answer: string;
  suggestedChartType?: "bar" | "pie" | "line" | "kpi" | "table";
  chartTitle?: string;
  filteredCount?: number;
  error?: string;
}
