import { NextRequest, NextResponse } from "next/server";
import { merchantRepo } from "@/lib/repositories";
import { policyService } from "@/lib/services/policy.service";
import {
  authenticatePlatform,
  authorizePlatformResource,
  PlatformAuthError,
} from "@/lib/auth/platform-auth";
import { MerchantNegotiationPolicySchema } from "@/lib/domain/validation";

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
    if (!policy) {
      return NextResponse.json(
        {
          error: {
            code: "POLICY_NOT_FOUND",
            message: `No policy configured for merchant '${id}'.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    const view = req.nextUrl.searchParams.get("view");
    if (view === "public" || view === "buyer") {
      return NextResponse.json({
        success: true,
        policy: policyService.sanitizeMerchantPolicy(policy),
        requestId: authContext.requestId,
      });
    }

    return NextResponse.json({
      success: true,
      policy,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve merchant policy" } },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validated = MerchantNegotiationPolicySchema.parse({
      ...body,
      platformId: authContext.platformId,
      merchantId: id,
    });

    const saved = await policyService.setMerchantPolicy(id, validated);

    return NextResponse.json({
      success: true,
      policy: saved,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      {
        error: {
          code: "INVALID_POLICY_PAYLOAD",
          message: error instanceof Error ? error.message : "Failed to update merchant policy",
        },
      },
      { status: 400 }
    );
  }
}
