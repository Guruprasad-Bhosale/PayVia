import { NextRequest, NextResponse } from "next/server";
import { negotiationService } from "@/lib/services/negotiation.service";
import { agreementService } from "@/lib/services/agreement.service";
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

    const body = await req.json().catch(() => ({}));
    const proposalId = body.proposalId;

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, `negotiations:${id}:accept`);
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    if (proposalId) {
      await negotiationService.acceptProposal(id, proposalId);
    }

    // Automatically seal the authoritative agreement
    const agreement = await agreementService.createAgreementFromProposal(id, proposalId);
    const responsePayload = {
      success: true,
      status: "AGREED",
      agreement,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        `negotiations:${id}:accept`,
        idempotencyService.hashRequest(body),
        200,
        responsePayload
      );
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      {
        error: {
          code: "NEGOTIATION_ACCEPT_FAILED",
          message: error instanceof Error ? error.message : "Failed to accept negotiation proposal",
        },
      },
      { status: 400 }
    );
  }
}
