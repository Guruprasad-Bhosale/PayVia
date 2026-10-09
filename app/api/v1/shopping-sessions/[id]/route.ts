import { NextRequest, NextResponse } from "next/server";
import { shoppingService } from "@/lib/services/shopping.service";
import { authenticatePlatform, authorizePlatformResource, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await authenticatePlatform(req);
    const { id } = await params;

    const session = await shoppingService.getShoppingSession(id);
    if (!session) {
      return NextResponse.json(
        { error: { code: "SESSION_NOT_FOUND", message: `ShoppingSession ${id} not found` } },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, session.platformId, "ShoppingSession");

    return NextResponse.json({
      success: true,
      session,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Internal error" } },
      { status: 500 }
    );
  }
}
