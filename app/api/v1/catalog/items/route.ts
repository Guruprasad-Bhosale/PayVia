import { NextRequest, NextResponse } from "next/server";
import { catalogRepo, merchantRepo } from "@/lib/repositories";
import { CatalogItemCreateSchema } from "@/lib/domain/validation";
import { CatalogItem } from "@/lib/domain/types";
import { getCatalogProvider } from "@/lib/providers/catalog";
import { idempotencyService } from "@/lib/services/idempotency.service";
import {
  authenticatePlatform,
  authorizePlatformResource,
  PlatformAuthError,
} from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  try {
    const authContext = await authenticatePlatform(req);
    const body = await req.json();

    if (idempotencyKey) {
      const existing = await idempotencyService.getExistingRecord(idempotencyKey, "catalog:create");
      if (existing) {
        return NextResponse.json(JSON.parse(existing.responseBody), { status: existing.statusCode });
      }
    }

    const validated = CatalogItemCreateSchema.parse({
      ...body,
      platformId: authContext.platformId,
    });

    // Check that merchant belongs to platform
    const merchant = await merchantRepo.findById(validated.merchantId);
    if (merchant) {
      authorizePlatformResource(authContext, merchant.platformId, "merchant");
    }

    const itemId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const item: CatalogItem = {
      id: itemId,
      platformId: authContext.platformId,
      merchantId: validated.merchantId,
      sku: validated.sku,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      listPrice: validated.listPrice,
      currency: validated.currency,
      stockStatus: validated.stockStatus,
      source: validated.source || "internal",
      imageUrl: validated.imageUrl,
      metadata: validated.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await catalogRepo.create(item);
    const responsePayload = {
      success: true,
      item: saved,
      requestId: authContext.requestId,
    };

    if (idempotencyKey) {
      await idempotencyService.saveRecord(
        idempotencyKey,
        "catalog:create",
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
          code: "INVALID_CATALOG_ITEM",
          message: error instanceof Error ? error.message : "Failed to create catalog item",
        },
      },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authContext = await authenticatePlatform(req);
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "*";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const catalog = getCatalogProvider();
    const searchResult = await catalog.search(query, {
      limit,
      platformId: authContext.platformId,
    });

    return NextResponse.json({
      success: true,
      source: searchResult.source,
      items: searchResult.items,
      totalCount: searchResult.totalCount,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to search catalog" } },
      { status: 500 }
    );
  }
}
