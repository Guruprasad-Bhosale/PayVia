import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/paypal/cancel
 * Handles cancellation redirects from PayPal Checkout.
 * Redirects the user back to the PayVia checkout page with a cancelled status notification.
 */
export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.origin || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/checkout?payment=cancelled`);
}