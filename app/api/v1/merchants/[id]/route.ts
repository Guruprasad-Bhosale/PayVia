import { NextRequest, NextResponse } from "next/server";
import { merchantRepo } from "@/lib/repositories";
import { policyService } from "@/lib/services/policy.service";
import {
  authenticatePlatform,
  authorizePlatformResource,
  PlatformAuthError,
} from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticatePlatform(req);
    const { id } = await context.params;
    const merchant = await merchantRepo.findById(id);

    if (!merchant) {
      return NextResponse.json(
        {
          error: {
            code: "MERCHANT_NOT_FOUND",
            message: `Merchant with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, merchant.platformId, "merchant");

    const policy = await policyService.getMerchantPolicy(id);
    const sanitizedPolicy = policy ? policyService.sanitizeMerchantPolicy(policy) : null;

    return NextResponse.json({
      success: true,
      merchant,
      policy: sanitizedPolicy,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve merchant" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticatePlatform(req);
    const { id } = await context.params;
    const merchant = await merchantRepo.findById(id);

    if (!merchant) {
      return NextResponse.json(
        {
          error: {
            code: "MERCHANT_NOT_FOUND",
            message: `Merchant with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, merchant.platformId, "merchant");

    const body = await req.json();
    const updated = await merchantRepo.update(id, {
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.settlementEmail !== undefined && { settlementEmail: body.settlementEmail }),
      ...(body.metadata && { metadata: body.metadata }),
    });

    return NextResponse.json({
      success: true,
      merchant: updated,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "INVALID_MERCHANT_UPDATE", message: "Failed to update merchant" } },
      { status: 400 }
    );
  }
}
