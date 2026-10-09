import { NextRequest, NextResponse } from "next/server";
import { shoppingService } from "@/lib/services/shopping.service";
import { authenticatePlatform, authorizePlatformResource, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  try {
    const authContext = await authenticatePlatform(req);
    const { id, offerId } = await params;

    const session = await shoppingService.getShoppingSession(id);
    if (!session) {
      return NextResponse.json(
        { error: { code: "SESSION_NOT_FOUND", message: `ShoppingSession ${id} not found` } },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, session.platformId, "ShoppingSession");

    const result = await shoppingService.selectOffer(id, { offerId });

    return NextResponse.json({
      success: true,
      session: result.session,
      transaction: result.transaction,
      agreement: result.agreement,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SELECTION_ERROR", message: error instanceof Error ? error.message : "Failed to select offer" } },
      { status: 400 }
    );
  }
}
