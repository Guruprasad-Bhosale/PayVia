import { NextRequest, NextResponse } from "next/server";
import { negotiationService } from "@/lib/services/negotiation.service";
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
    const negotiation = await negotiationService.getNegotiation(id);

    if (!negotiation) {
      return NextResponse.json(
        {
          error: {
            code: "NEGOTIATION_NOT_FOUND",
            message: `Negotiation with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, negotiation.platformId, "negotiation");

    return NextResponse.json({
      success: true,
      negotiation,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve negotiation" } },
      { status: 500 }
    );
  }
}
