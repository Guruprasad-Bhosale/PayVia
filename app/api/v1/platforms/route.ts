import { NextRequest, NextResponse } from "next/server";
import { platformRepo } from "@/lib/repositories";
import { PlatformCreateSchema } from "@/lib/domain/validation";
import { Platform } from "@/lib/domain/types";
import { idempotencyService } from "@/lib/services/idempotency.service";
import { generatePlatformApiKey } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, "platforms:create");
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const validated = PlatformCreateSchema.parse(body);
    const platformId = `plat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const apiKeyData = generatePlatformApiKey(platformId, "test");

    const platform: Platform = {
      id: platformId,
      name: validated.name,
      status: "ACTIVE",
      apiKeyHash: apiKeyData.keyHash,
      webhookUrl: validated.webhookUrl,
      metadata: validated.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await platformRepo.create(platform);

    const responsePayload = {
      success: true,
      platform: {
        id: saved.id,
        name: saved.name,
        status: saved.status,
        webhookUrl: saved.webhookUrl,
        createdAt: saved.createdAt,
      },
      credentials: {
        apiKey: apiKeyData.rawKey,
        prefix: apiKeyData.prefix,
        warning: "Store this API key safely. You will not be able to see it again.",
      },
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        "platforms:create",
        idempotencyService.hashRequest(body),
        201,
        responsePayload
      );
    }

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PLATFORM_PAYLOAD",
          message: error instanceof Error ? error.message : "Failed to create platform",
        },
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  const platforms = await platformRepo.list();
  return NextResponse.json({
    success: true,
    platforms: platforms.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      webhookUrl: p.webhookUrl,
      createdAt: p.createdAt,
    })),
  });
}
