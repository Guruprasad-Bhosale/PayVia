import { NextRequest, NextResponse } from "next/server";
import { agreementService } from "@/lib/services/agreement.service";
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

    const verification = agreementService.verifyAgreementForSettlement(agreement);

    return NextResponse.json({
      success: true,
      agreement,
      cryptographicVerification: {
        valid: verification.valid,
        hash: agreement.agreementHash,
        error: verification.error,
      },
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve agreement" } },
      { status: 500 }
    );
  }
}
