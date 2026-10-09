import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/lib/services/settlement.service";
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
    const settlement = await settlementService.getSettlement(id);

    if (!settlement) {
      return NextResponse.json(
        {
          error: {
            code: "SETTLEMENT_NOT_FOUND",
            message: `Settlement with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, settlement.platformId, "settlement");

    return NextResponse.json({
      success: true,
      settlement,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve settlement" } },
      { status: 500 }
    );
  }
}
