import { NextRequest, NextResponse } from "next/server";
import { negotiationService } from "@/lib/services/negotiation.service";
import { idempotencyService } from "@/lib/services/idempotency.service";
import {
  authenticatePlatform,
  authorizePlatformResource,
  PlatformAuthError,
} from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const authContext = await authenticatePlatform(req);
    const negotiation = await negotiationService.getNegotiation(id);

    if (!negotiation) {
      return NextResponse.json(
        {
          error: {
            code: "NEGOTIATION_NOT_FOUND",
            message: `Negotiation with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, negotiation.platformId, "negotiation");

    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, `negotiations:${id}:proposals`);
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const result = await negotiationService.submitProposal(id, body);

    if (!result.acceptedByPolicy) {
      return NextResponse.json(
        {
          error: {
            code: "MERCHANT_OR_BUYER_POLICY_VIOLATION",
            message: "Proposal cannot be accepted under authoritative negotiation policy bounds.",
            violations: result.policyViolations,
            requestId: authContext.requestId,
          },
          proposal: result.proposal,
        },
        { status: 422 }
      );
    }

    const responsePayload = {
      success: true,
      proposal: result.proposal,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        `negotiations:${id}:proposals`,
        idempotencyService.hashRequest(body),
        201,
        responsePayload
      );
    }

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      {
        error: {
          code: "PROPOSAL_SUBMISSION_FAILED",
          message: error instanceof Error ? error.message : "Failed to submit proposal",
        },
      },
      { status: 400 }
    );
  }
}
