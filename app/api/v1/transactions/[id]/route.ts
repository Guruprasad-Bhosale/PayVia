import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services/transaction.service";
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
    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          error: {
            code: "TRANSACTION_NOT_FOUND",
            message: `Transaction with id '${id}' was not found.`,
            requestId: authContext.requestId,
          },
        },
        { status: 404 }
      );
    }

    authorizePlatformResource(authContext, transaction.platformId, "transaction");

    return NextResponse.json({
      success: true,
      transaction,
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve transaction" } },
      { status: 500 }
    );
  }
}
