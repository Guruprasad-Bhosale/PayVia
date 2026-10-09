import { NextRequest, NextResponse } from "next/server";
import { merchantRepo } from "@/lib/repositories";
import { MerchantCreateSchema } from "@/lib/domain/validation";
import { Merchant } from "@/lib/domain/types";
import { idempotencyService } from "@/lib/services/idempotency.service";
import { authenticatePlatform, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const authContext = await authenticatePlatform(req);
    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, "merchants:create");
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const validated = MerchantCreateSchema.parse({
      ...body,
      platformId: authContext.platformId, // Server authoritative platform ID
    });

    const merchantId = `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const merchant: Merchant = {
      id: merchantId,
      platformId: authContext.platformId,
      name: validated.name,
      email: validated.email,
      settlementEmail: validated.settlementEmail,
      status: "ACTIVE",
      metadata: validated.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await merchantRepo.create(merchant);
    const responsePayload = {
      success: true,
      merchant: saved,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        "merchants:create",
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
          code: "INVALID_MERCHANT_PAYLOAD",
          message: error instanceof Error ? error.message : "Failed to create merchant",
        },
      },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authContext = await authenticatePlatform(req);
    const merchants = await merchantRepo.findByPlatformId(authContext.platformId);
    return NextResponse.json({
      success: true,
      merchants,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to list merchants" } },
      { status: 500 }
    );
  }
}
