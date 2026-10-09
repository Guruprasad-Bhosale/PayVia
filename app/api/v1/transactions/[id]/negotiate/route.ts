import { NextRequest, NextResponse } from "next/server";
import { negotiationService } from "@/lib/services/negotiation.service";
import { transactionService } from "@/lib/services/transaction.service";
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
    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSACTION_NOT_FOUND",
            message: `Transaction with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, transaction.platformId, "transaction");

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, `transactions:${id}:negotiate`);
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const runAuto = req.nextUrl.searchParams.get("auto") === "true" || body?.mode === "auto" || body?.runAutonomous === true;

    let responsePayload: any;

    if (runAuto) {
      const autoResult = await negotiationService.runAutonomousNegotiation(id);
      responsePayload = {
        success: true,
        negotiation: autoResult.session,
        finalProposal: autoResult.finalProposal,
        agreed: autoResult.agreed,
        requestId: authContext.requestId,
      };
    } else {
      const session = await negotiationService.startNegotiation(id);
      responsePayload = {
        success: true,
        negotiation: session,
        requestId: authContext.requestId,
      };
    }

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        `transactions:${id}:negotiate`,
        idempotencyService.hashRequest({ transactionId: id, mode: runAuto ? "auto" : "manual" }),
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
          code: "NEGOTIATION_START_FAILED",
          message: error instanceof Error ? error.message : "Failed to start negotiation",
        },
      },
      { status: 400 }
    );
  }
}
