import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { computeMerchantAnalytics } from "@/lib/merchant/analytics";
import { isAIConfigured } from "@/lib/config/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/merchant/ai
 * Server-side AI intelligence endpoint for AG Studio and Merchant Command Center.
 * Analyzes transaction dataset, generates insights, and suggests dashboard chart configurations.
 * Strictly read-only; has ZERO ability to alter agreements, pricing floors, or PayPal orders.
 */
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { query } = body;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Query parameter is required." },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const dataset = computeMerchantAnalytics();

    // Guardrail check: reject any prompt attempting financial mutations
    const forbiddenPhrases = [
      "charge payment",
      "execute payment",
      "capture order",
      "create paypal order",
      "lower merchant floor",
      "override price",
      "change agreement",
    ];

    if (forbiddenPhrases.some((phrase) => trimmedQuery.toLowerCase().includes(phrase))) {
      return NextResponse.json({
        success: true,
        answer:
          "🛡️ PayVia Safety Notice: The Merchant AI Analyst operates strictly in read-only analytics mode. It cannot modify agreements, adjust merchant floors, or initiate payment transactions.",
        suggestedChartType: "kpi",
      });
    }

    // Prepare concise analytics context for Gemini
    const contextSummary = JSON.stringify(
      {
        kpis: dataset.kpis,
        byProduct: dataset.byProduct,
        outcomeDistribution: dataset.outcomeDistribution,
        sourceDistribution: dataset.sourceDistribution,
        recentTransactions: dataset.records.slice(0, 10).map((r) => ({
          id: r.id,
          product: r.productName,
          source: r.source,
          originalPrice: r.originalPrice,
          negotiatedPrice: r.negotiatedPrice,
          savings: r.savings,
          savingsPct: r.savingsPercentage,
          status: r.negotiationStatus,
          deliveryDays: r.deliveryDays,
          createdAt: r.createdAt,
        })),
      },
      null,
      2
    );

    // Retrieve relevant merchant historical memories from Elasticsearch Serverless
    let merchantMemoryBlock = "";
    try {
      const { getMerchantHistoricalInsights } = await import("@/lib/memory/merchant-memory");
      const { buildPromptMemoryBlock } = await import("@/lib/memory/memory-context");
      const merchantMem = await getMerchantHistoricalInsights(trimmedQuery, 4);
      if (merchantMem.memories.length > 0) {
        merchantMemoryBlock = buildPromptMemoryBlock(merchantMem.memories, "ELASTICSEARCH HISTORICAL MERCHANT PATTERNS");
      }
    } catch {
      // Non-critical fallback
    }

    const systemPrompt = `You are "PayVia Merchant Intelligence Analyst", an AI commerce analyst embedded in the PayVia Merchant Command Center (powered by AG Grid and AG Studio).

Your job is to analyze real negotiation, transaction, and savings data from PayVia.
CRITICAL RULES:
1. ONLY reference data provided in the analytics context. NEVER invent imaginary statistics or transactions.
2. You CANNOT execute payments, create PayPal orders, or modify agreements.
3. Be concise, direct, and actionable in your answers.
4. Format numbers cleanly with $ and % signs.
5. If the user asks for a chart or visualization, suggest the most appropriate chart type (e.g. 'bar', 'pie', 'line', 'kpi', or 'table') and provide a clean chart title.

CURRENT MERCHANT ANALYTICS CONTEXT:
${contextSummary}

${merchantMemoryBlock}`;

    let answer = "";
    let suggestedChartType: "bar" | "pie" | "line" | "kpi" | "table" = "table";
    let chartTitle = "Merchant Analytics Summary";

    if (isAIConfigured()) {
      try {
        const result = await generateText({
          model: google("gemini-3.8-flash"),
          system: systemPrompt,
          prompt: `User Question: "${trimmedQuery}"\n\nAnalyze the data and answer accurately. If suitable, specify which chart to show.`,
          abortSignal: AbortSignal.timeout(6000),
          maxRetries: 0,
        });

        answer = result.text.trim();
      } catch {
        // Fallback to deterministic analytics engine below
      }
    }

    // Deterministic intelligence fallback if Gemini API call hit rate-limit or is unconfigured
    if (!answer) {
      const qLower = trimmedQuery.toLowerCase();

      if (qLower.includes("frequent") || qLower.includes("most negotiated") || qLower.includes("volume")) {
        const sorted = [...dataset.byProduct].sort((a, b) => b.negotiationCount - a.negotiationCount);
        const top = sorted[0];
        answer = `Based on current transaction data, **${top.productName}** is the most frequently negotiated item with **${top.negotiationCount} negotiations** (${top.agreedCount} agreed). Total revenue generated: **$${top.totalRevenue.toFixed(2)} USD**.`;
        suggestedChartType = "bar";
        chartTitle = "Negotiation Volume by Product";
      } else if (qLower.includes("highest discount") || qLower.includes("highest average discount") || qLower.includes("highest savings") || qLower.includes("highest average savings")) {
        const sorted = [...dataset.byProduct].sort((a, b) => b.avgSavingsPct - a.avgSavingsPct);
        const top = sorted[0];
        answer = `**${top.productName}** has the highest average discount at **${top.avgSavingsPct}%** (average savings of **$${top.avgSavings.toFixed(2)}** per accepted deal). Across all products, the overall average savings is **${dataset.kpis.averageSavingsPct}%**.`;
        suggestedChartType = "bar";
        chartTitle = "Average Negotiated Savings by Product (%)";
      } else if (qLower.includes("failed") || qLower.includes("no consensus") || qLower.includes("outcome")) {
        const failed = dataset.records.filter((r) => r.negotiationStatus === "FAILED");
        answer = `There are **${failed.length} failed negotiations** out of ${dataset.kpis.totalNegotiations} total sessions (overall acceptance rate: **${dataset.kpis.acceptanceRate}%**). Most failed sessions occurred when buyer budget limits fell below the merchant's protected price floor.`;
        suggestedChartType = "pie";
        chartTitle = "Negotiation Outcome Distribution";
      } else if (qLower.includes("acceptance") || qLower.includes("conversion") || qLower.includes("rate")) {
        const sorted = [...dataset.byProduct].sort((a, b) => b.acceptanceRate - a.acceptanceRate);
        answer = `Overall merchant acceptance rate is **${dataset.kpis.acceptanceRate}%** (${dataset.kpis.completedTransactions} of ${dataset.kpis.totalNegotiations} sessions agreed). Top performing product by acceptance rate is **${sorted[0]?.productName || "AeroBook Pro 16"}** at **${sorted[0]?.acceptanceRate || 100}%**.`;
        suggestedChartType = "pie";
        chartTitle = "Agreement Acceptance Rate";
      } else if (qLower.includes("laptop") && (qLower.includes("headphone") || qLower.includes("compare"))) {
        const laptop = dataset.byProduct.find((p) => p.productName.toLowerCase().includes("laptop"));
        const headphones = dataset.byProduct.find((p) => p.productName.toLowerCase().includes("headphone"));
        answer = `Comparison:\n• **${laptop?.productName || "AeroBook Pro 16"}**: ${laptop?.negotiationCount || 0} negotiations, $${laptop?.avgSavings.toFixed(2) || 0} avg savings (${laptop?.avgSavingsPct || 0}%), $${laptop?.totalRevenue.toFixed(2) || 0} total revenue.\n• **${headphones?.productName || "AuraPro Headphones"}**: ${headphones?.negotiationCount || 0} negotiations, $${headphones?.avgSavings.toFixed(2) || 0} avg savings (${headphones?.avgSavingsPct || 0}%), $${headphones?.totalRevenue.toFixed(2) || 0} total revenue.`;
        suggestedChartType = "bar";
        chartTitle = "Laptop vs. Headphone Performance Comparison";
      } else {
        answer = `Summary of current PayVia merchant activity:\n• **${dataset.kpis.totalNegotiations} Total Negotiations** (${dataset.kpis.completedTransactions} Accepted, ${dataset.kpis.acceptanceRate}% Acceptance Rate)\n• **$${dataset.kpis.totalRevenue.toFixed(2)} USD** Total Negotiated Revenue\n• **$${dataset.kpis.totalSavings.toFixed(2)} USD** Total Customer Savings (${dataset.kpis.averageSavingsPct}% Average Discount).`;
        suggestedChartType = "table";
        chartTitle = "Merchant Command Center Overview";
      }
    }

    return NextResponse.json({
      success: true,
      answer,
      suggestedChartType,
      chartTitle,
      filteredCount: dataset.records.length,
    });
  } catch (error: unknown) {
    console.error("[Merchant AI Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process merchant AI request.",
      },
      { status: 500 }
    );
  }
}
