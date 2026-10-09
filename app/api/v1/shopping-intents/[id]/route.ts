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

    const intent = await shoppingService.getShoppingIntent(id);
    if (!intent) {
      return NextResponse.json(
        { error: { code: "INTENT_NOT_FOUND", message: `ShoppingIntent ${id} not found` } },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, intent.platformId, "ShoppingIntent");

    return NextResponse.json({
      success: true,
      intent,
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
