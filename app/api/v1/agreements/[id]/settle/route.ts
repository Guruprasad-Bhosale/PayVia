import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/lib/services/settlement.service";
import { agreementService } from "@/lib/services/agreement.service";
import { SettleAgreementSchema } from "@/lib/domain/validation";
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
    const agreement = await agreementService.getAgreement(id);

    if (!agreement) {
      return NextResponse.json(
        {
          error: {
            code: "AGREEMENT_NOT_FOUND",
            message: `Agreement with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, agreement.platformId, "agreement");

    const body = await req.json().catch(() => ({}));

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, `agreements:${id}:settle`);
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const validated = SettleAgreementSchema.parse(body);

    // Require human approval before settlement initiation
    await agreementService.approveAgreement(id);

    const result = await settlementService.initiateSettlement(id, {
      provider: validated.provider,
      returnUrl: validated.returnUrl,
      cancelUrl: validated.cancelUrl,
    });

    const responsePayload = {
      success: true,
      settlement: result.settlement,
      approvalUrl: result.approvalUrl,
      agreementAmount: result.settlement.amount,
      currency: result.settlement.currency,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        `agreements:${id}:settle`,
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
          code: "SETTLEMENT_INITIATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to initiate payment settlement",
        },
      },
      { status: 400 }
    );
  }
}
