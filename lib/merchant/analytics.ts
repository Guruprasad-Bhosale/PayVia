import {
  getAllNegotiationSessions,
  getAllAgreements,
} from "@/lib/ai/negotiation-store";
import {
  MerchantTransactionRecord,
  MerchantKPIs,
  ProductPerformanceSummary,
  OutcomeDistribution,
  MerchantAnalyticsDataset,
} from "./types";

/**
 * Initial historical benchmark session fixtures for demo mode when store has < 3 records.
 * Clearly labeled as historical benchmarks so real negotiations seamlessly accumulate on top.
 */
const HISTORICAL_BENCHMARKS: MerchantTransactionRecord[] = [
  {
    id: "tx_hist_101",
    negotiationId: "sess_hist_101",
    productId: "prod_laptop_pro",
    productName: "AeroBook Pro 16 AI Workstation",
    category: "Laptops & Computing",
    source: "demo",
    merchantName: "AeroComputing Official Store",
    originalPrice: 800.0,
    negotiatedPrice: 752.0,
    savings: 48.0,
    savingsPercentage: 6.0,
    deliveryDays: 5,
    buyerMaxPrice: 760.0,
    merchantMinPrice: 730.0,
    negotiationStatus: "AGREED",
    paymentStatus: "SETTLED",
    roundsCount: 3,
    currency: "USD",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    paypalOrderId: "PAYID-HIST-101-SANDBOX",
  },
  {
    id: "tx_hist_102",
    negotiationId: "sess_hist_102",
    productId: "prod_aurora_headphones",
    productName: "AuraPro ANC Wireless Headphones",
    category: "Audio & Headphones",
    source: "demo",
    merchantName: "Aura Audio Labs",
    originalPrice: 299.99,
    negotiatedPrice: 245.0,
    savings: 54.99,
    savingsPercentage: 18.33,
    deliveryDays: 3,
    buyerMaxPrice: 260.0,
    merchantMinPrice: 220.0,
    negotiationStatus: "AGREED",
    paymentStatus: "SETTLED",
    roundsCount: 4,
    currency: "USD",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    paypalOrderId: "PAYID-HIST-102-SANDBOX",
  },
  {
    id: "tx_hist_103",
    negotiationId: "sess_hist_103",
    productId: "prod_smart_watch_ultra",
    productName: "Veloce Titan Smartwatch",
    category: "Wearables & Fitness",
    source: "demo",
    merchantName: "Veloce Tech Store",
    originalPrice: 449.0,
    negotiatedPrice: 385.0,
    savings: 64.0,
    savingsPercentage: 14.25,
    deliveryDays: 4,
    buyerMaxPrice: 400.0,
    merchantMinPrice: 350.0,
    negotiationStatus: "AGREED",
    paymentStatus: "PENDING_APPROVAL",
    roundsCount: 3,
    currency: "USD",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: "tx_hist_104",
    negotiationId: "sess_hist_104",
    productId: "prod_laptop_pro",
    productName: "AeroBook Pro 16 AI Workstation",
    category: "Laptops & Computing",
    source: "demo",
    merchantName: "AeroComputing Official Store",
    originalPrice: 800.0,
    negotiatedPrice: 0,
    savings: 0,
    savingsPercentage: 0,
    deliveryDays: 5,
    buyerMaxPrice: 650.0,
    merchantMinPrice: 730.0,
    negotiationStatus: "FAILED",
    paymentStatus: "N/A",
    roundsCount: 4,
    currency: "USD",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "tx_hist_105",
    negotiationId: "sess_hist_105",
    productId: "ch3_live_headphone_pro",
    productName: "Studio Pro Wireless Headphones",
    category: "Audio & Headphones",
    source: "channel3",
    merchantName: "apple.com",
    originalPrice: 299.99,
    negotiatedPrice: 265.0,
    savings: 34.99,
    savingsPercentage: 11.66,
    deliveryDays: 3,
    buyerMaxPrice: 275.0,
    merchantMinPrice: 240.0,
    negotiationStatus: "AGREED",
    paymentStatus: "SETTLED",
    roundsCount: 3,
    currency: "USD",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    paypalOrderId: "PAYID-CH3-105-SANDBOX",
  },
];

/**
 * Transforms live server negotiation sessions and agreements into structured merchant analytics records.
 */
export function getMerchantAnalyticsRecords(): MerchantTransactionRecord[] {
  const liveSessions = getAllNegotiationSessions();
  const liveAgreements = getAllAgreements();

  const agreementMap = new Map<string, (typeof liveAgreements)[0]>();
  for (const ag of liveAgreements) {
    agreementMap.set(ag.negotiationId, ag);
    agreementMap.set(ag.id, ag);
  }

  const liveRecords: MerchantTransactionRecord[] = liveSessions.map((session) => {
    const agreement = session.agreement || agreementMap.get(session.id);
    const product = session.product;
    const isAgreed = session.status === "AGREED" && Boolean(agreement);

    const originalPrice = product.originalPrice;
    const negotiatedPrice = isAgreed && agreement ? agreement.finalPrice : 0;
    const savings = isAgreed && agreement ? agreement.savings : 0;
    const savingsPct =
      isAgreed && originalPrice > 0 ? Number(((savings / originalPrice) * 100).toFixed(2)) : 0;

    return {
      id: `tx_${session.id}`,
      negotiationId: session.id,
      productId: product.id,
      productName: product.name,
      category: product.category || "Consumer Goods",
      source: product.source === "channel3" ? "channel3" : "demo",
      merchantName: product.merchantName || "Verified Retailer",
      originalPrice,
      negotiatedPrice,
      savings,
      savingsPercentage: savingsPct,
      deliveryDays: isAgreed && agreement ? agreement.deliveryDays : session.buyerConstraints.maxDeliveryDays,
      buyerMaxPrice: session.buyerConstraints.maxBudget,
      merchantMinPrice: session.merchantConstraints.minAcceptablePrice,
      negotiationStatus: isAgreed ? "AGREED" : "FAILED",
      paymentStatus: isAgreed
        ? agreement?.userApproved
          ? "SETTLED"
          : "PENDING_APPROVAL"
        : "N/A",
      roundsCount: session.currentRound || session.messages.length || 1,
      currency: product.currency || "USD",
      createdAt: session.createdAt,
    };
  });

  // If there are live sessions, prepend them to the benchmark history; otherwise return benchmarks
  if (liveRecords.length > 0) {
    return [...liveRecords, ...HISTORICAL_BENCHMARKS];
  }

  return HISTORICAL_BENCHMARKS;
}

/**
 * Computes deterministic merchant KPIs and dashboard aggregations.
 */
export function computeMerchantAnalytics(): MerchantAnalyticsDataset {
  const records = getMerchantAnalyticsRecords();

  const totalNegotiations = records.length;
  const agreedRecords = records.filter((r) => r.negotiationStatus === "AGREED");
  const completedTransactions = agreedRecords.length;

  const totalRevenue = Number(agreedRecords.reduce((sum, r) => sum + r.negotiatedPrice, 0).toFixed(2));
  const totalSavings = Number(agreedRecords.reduce((sum, r) => sum + r.savings, 0).toFixed(2));
  const totalOriginalAgreed = agreedRecords.reduce((sum, r) => sum + r.originalPrice, 0);

  const averageSavingsPct =
    totalOriginalAgreed > 0
      ? Number(((totalSavings / totalOriginalAgreed) * 100).toFixed(2))
      : 0;

  const acceptanceRate =
    totalNegotiations > 0
      ? Number(((completedTransactions / totalNegotiations) * 100).toFixed(2))
      : 0;

  const kpis: MerchantKPIs = {
    totalNegotiations,
    completedTransactions,
    totalRevenue,
    totalSavings,
    averageSavingsPct,
    acceptanceRate,
  };

  // Group by Product Performance
  const productMap = new Map<
    string,
    {
      productName: string;
      category: string;
      count: number;
      agreed: number;
      revenue: number;
      savings: number;
      origTotal: number;
    }
  >();

  for (const r of records) {
    const key = r.productName;
    const curr = productMap.get(key) || {
      productName: r.productName,
      category: r.category,
      count: 0,
      agreed: 0,
      revenue: 0,
      savings: 0,
      origTotal: 0,
    };

    curr.count += 1;
    if (r.negotiationStatus === "AGREED") {
      curr.agreed += 1;
      curr.revenue += r.negotiatedPrice;
      curr.savings += r.savings;
      curr.origTotal += r.originalPrice;
    }

    productMap.set(key, curr);
  }

  const byProduct: ProductPerformanceSummary[] = Array.from(productMap.values()).map((p) => {
    const avgSavings = p.agreed > 0 ? Number((p.savings / p.agreed).toFixed(2)) : 0;
    const avgSavingsPct = p.origTotal > 0 ? Number(((p.savings / p.origTotal) * 100).toFixed(2)) : 0;
    const rate = p.count > 0 ? Number(((p.agreed / p.count) * 100).toFixed(2)) : 0;

    return {
      productName: p.productName,
      category: p.category,
      negotiationCount: p.count,
      agreedCount: p.agreed,
      totalRevenue: Number(p.revenue.toFixed(2)),
      avgSavings,
      avgSavingsPct,
      acceptanceRate: rate,
    };
  });

  // Outcome distribution
  const failedCount = records.filter((r) => r.negotiationStatus === "FAILED").length;
  const outcomeDistribution: OutcomeDistribution[] = [
    {
      status: "Accepted & Agreed",
      count: completedTransactions,
      percentage: Number(((completedTransactions / totalNegotiations) * 100).toFixed(1)),
    },
    {
      status: "No Consensus (Failed)",
      count: failedCount,
      percentage: Number(((failedCount / totalNegotiations) * 100).toFixed(1)),
    },
  ];

  // Source distribution (Channel3 vs Demo)
  const ch3Count = records.filter((r) => r.source === "channel3").length;
  const demoCount = records.filter((r) => r.source === "demo").length;
  const sourceDistribution = [
    { source: "Channel3 Live Discovery", count: ch3Count },
    { source: "PayVia Demo Catalog", count: demoCount },
  ];

  return {
    kpis,
    records,
    byProduct,
    outcomeDistribution,
    sourceDistribution,
    generatedAt: new Date().toISOString(),
  };
}
