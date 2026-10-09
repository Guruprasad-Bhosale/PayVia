import { NextRequest, NextResponse } from "next/server";
import { approveNegotiationAgreement } from "@/lib/ai/negotiation-store";
import { agreementService } from "@/lib/services/agreement.service";
import { agreementRepo } from "@/lib/repositories";

export const dynamic = "force-dynamic";

/**
 * POST /api/negotiate/approve
 * Explicit human approval gate.
 * Marks the agreement as approved on the authoritative server-side state
 * before enabling PayPal Sandbox checkout initiation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || body.agreementId || body.negotiationId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required agreement or negotiation id." },
        { status: 400 }
      );
    }

    // 1. Check in-memory negotiation store
    const storeAgreement = approveNegotiationAgreement(id);

    // 2. Check domain repository & agreement service
    let domainAgreement = await agreementRepo.findById(id);
    if (!domainAgreement && storeAgreement?.id) {
      domainAgreement = await agreementRepo.findById(storeAgreement.id);
    }

    if (domainAgreement) {
      domainAgreement = await agreementService.approveAgreement(domainAgreement.id);
    }

    if (!storeAgreement && !domainAgreement) {
      return NextResponse.json(
        { success: false, error: `Agreement '${id}' not found for approval.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agreement successfully approved by human buyer.",
      agreementId: domainAgreement?.id || storeAgreement?.id,
      userApproved: true,
      userApprovedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Agreement Approval Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record agreement approval.",
      },
      { status: 500 }
    );
  }
}
