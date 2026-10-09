import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transaction.service";
import { idempotencyService } from "@/lib/services/idempotency.service";
import { authenticatePlatform, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const authContext = await authenticatePlatform(req);
    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, "transactions:create");
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const transaction = await transactionService.createTransaction({
      ...body,
      platformId: authContext.platformId,
    });

    const responsePayload = {
      success: true,
      transaction,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        "transactions:create",
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
          code: "INVALID_TRANSACTION_INTENT",
          message: error instanceof Error ? error.message : "Failed to create transaction",
        },
      },
      { status: 400 }
    );
  }
}
