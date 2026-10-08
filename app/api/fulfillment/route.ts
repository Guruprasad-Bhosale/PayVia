import { NextRequest, NextResponse } from "next/server";
import {
  getAllFulfillmentPlans,
  getFulfillmentPlan,
  createFulfillmentPlanForNegotiation,
  getOrCreateFulfillmentPlan,
} from "@/lib/fulfillment/planner";
import { getNegotiationAgreement } from "@/lib/ai/negotiation-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/fulfillment
 * Returns a specific fulfillment plan (by ?negotiationId= or ?id=) or all plans.
 */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id") || req.nextUrl.searchParams.get("negotiationId");

    if (id) {
      let plan = getFulfillmentPlan(id);

      // If plan not found in fulfillment store, check if negotiation agreement exists to build it on the fly
      if (!plan) {
        const agreement = getNegotiationAgreement(id);
        if (agreement && agreement.status === "AGREED") {
          plan = getOrCreateFulfillmentPlan(agreement);
        }
      }

      if (!plan) {
        return NextResponse.json(
          {
            success: false,
            error: `Fulfillment plan for ID '${id}' not found. Please verify negotiation ID.`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        plan,
        tasks: plan.tasks,
        resources: plan.resources,
        dependencies: plan.dependencies,
        riskAnalysis: plan.riskAnalysis,
        status: plan.status,
        promisedDeliveryDate: plan.promisedDeliveryDate,
      });
    }

    // Otherwise return all available plans
    const allPlans = getAllFulfillmentPlans();
    return NextResponse.json({
      success: true,
      plans: allPlans,
      count: allPlans.length,
    });
  } catch (error) {
    console.error("[Fulfillment API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve fulfillment plan",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fulfillment
 * Creates a fulfillment plan for a validated agreement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetId = body.negotiationId || body.agreementId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Missing required negotiationId or agreementId" },
        { status: 400 }
      );
    }

    const result = createFulfillmentPlanForNegotiation(targetId, {
      paypalOrderId: body.paypalOrderId,
      paypalCaptureId: body.paypalCaptureId,
      simulatedDelayHours: body.simulatedDelayHours,
    });

    if (!result.success || !result.plan) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create fulfillment plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fulfillment plan generated successfully.",
      plan: result.plan,
    });
  } catch (error) {
    console.error("[Fulfillment Create Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fulfillment creation error",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
