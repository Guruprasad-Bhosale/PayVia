import { NextResponse } from "next/server";
import { computeMerchantAnalytics } from "@/lib/merchant/analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/merchant/analytics
 * Returns normalized merchant analytics records, aggregations, and KPIs for AG Grid and AG Studio.
 * Strictly read-only; never exposes private API keys or sensitive authorization tokens.
 */
export async function GET() {
  try {
    const dataset = computeMerchantAnalytics();

    return NextResponse.json({
      success: true,
      data: dataset,
    });
  } catch (error: unknown) {
    console.error("[Merchant Analytics API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load merchant analytics data.",
      },
      { status: 500 }
    );
  }
}
