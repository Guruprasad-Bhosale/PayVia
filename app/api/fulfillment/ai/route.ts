import { NextRequest, NextResponse } from "next/server";
import { queryFulfillmentAi } from "@/lib/fulfillment/ai-agent";
import { getFulfillmentPlan, getAllFulfillmentPlans } from "@/lib/fulfillment/planner";
import { getNegotiationAgreement } from "@/lib/ai/negotiation-store";
import { getOrCreateFulfillmentPlan } from "@/lib/fulfillment/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/fulfillment/ai
 * Provides AI-driven analysis of fulfillment timelines and schedule dependencies.
 * STRICT READ-ONLY: Cannot modify financial terms or pricing records.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || body.message;
    const targetId = body.negotiationId || body.id || body.planId;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required query string in request body" },
        { status: 400 }
      );
    }

    let plan = targetId ? getFulfillmentPlan(targetId) : undefined;

    if (!plan && targetId) {
      const agreement = getNegotiationAgreement(targetId);
      if (agreement && agreement.status === "AGREED") {
        plan = getOrCreateFulfillmentPlan(agreement);
      }
    }

    // If still no specific plan, take the latest available plan
    if (!plan) {
      const allPlans = getAllFulfillmentPlans();
      plan = allPlans[0];
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "No active fulfillment plan found to analyze" },
        { status: 404 }
      );
    }

    const aiResponse = await queryFulfillmentAi(query, plan);

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("[Fulfillment AI API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fulfillment AI query failed",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
