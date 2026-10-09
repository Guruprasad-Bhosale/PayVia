import { NextRequest, NextResponse } from "next/server";
import { shoppingService } from "@/lib/services/shopping.service";
import { idempotencyService } from "@/lib/services/idempotency.service";
import { authenticatePlatform, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const authContext = await authenticatePlatform(req);
    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, "shopping-intents:create");
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const { intent, session } = await shoppingService.createShoppingIntent({
      ...body,
      platformId: authContext.platformId,
    });

    const responsePayload = {
      success: true,
      intent,
      session,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        "shopping-intents:create",
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
          code: "INVALID_SHOPPING_INTENT",
          message: error instanceof Error ? error.message : "Failed to create shopping intent",
        },
      },
      { status: 400 }
    );
  }
}
